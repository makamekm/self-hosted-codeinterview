import { Injectable, Module, OnModuleInit, SetMetadata } from "@nestjs/common";
import { Controller, Provider } from "@nestjs/common/interfaces";
import { MetadataScanner, ModulesContainer } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { RedisService } from "nestjs-redis";
import { v4 as uuidv4 } from "uuid";
import { makeSimpleHotPromise } from "~/utils/hot-promise.util";

@Injectable()
export class AskProvider {
  constructor(private readonly redisService: RedisService) {
    this.redisService.getClient().on("answer", this.onResponse);
  }

  askQueue: {
    [id: string]: {
      promise: ReturnType<typeof makeSimpleHotPromise>;
      timeout: NodeJS.Timeout;
    };
  } = {};
  subscribers: (() => any)[];

  async ask<T = any>(name: string, ...args) {
    const id = uuidv4();
    const promise = makeSimpleHotPromise<T>();
    const timeout = this.askQueue[id].timeout;
    this.askQueue[id] = {
      promise,
      timeout,
    };
    try {
      const hasSent = await this.redisService.getClient().emit("ask_" + name, id, ...args);
      if (!hasSent) {
        clearTimeout(timeout);
        promise.reject("Failed to send via Redis!");
      }
    } catch (error) {
      clearTimeout(timeout);
      promise.reject(error);
    } finally {
      return promise.promise;
    }
  }

  async onResponse(id, data) {
    if (this.askQueue[id]) {
      clearTimeout(this.askQueue[id].timeout);
      this.askQueue[id].promise.resolve(data);
    }
  }

  public async emit(id: string, data) {
    await this.redisService.getClient().emit("answer", id, data);
  }

  subscribe(topic: string, callback) {
    this.redisService.getClient().on("ask_" + topic, callback);
  }
}

const ASK_SERVICE_SUBSCRIBER = "ASK_SERVICE_SUBSCRIBER";

@Injectable()
export class AskServiceSubscriberExplorer {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner
  ) { }

  public explore(): ISubscribeMetadata[] {
    // const providers = [...this.modulesContainer.values()]
    //   .map((module) => {
    //     return [...module.providers.values()];
    //   })
    //   .reduce((a, b) => a.concat(b), []);

    // find all the controllers
    const modules = [...this.modulesContainer.values()];
    const controllersMap = modules
      .filter(({ controllers }) => controllers.size > 0)
      .map(({ controllers }) => controllers);

    const providersMap = modules
      .filter(({ providers }) => providers.size > 0)
      .map(({ providers }) => providers)
      .flat();

    // munge the instance wrappers into a nice format
    let instanceWrappers: InstanceWrapper<Controller | Provider>[] = [];

    controllersMap.forEach((map) => {
      const mapKeys = [...map.keys()];
      instanceWrappers.push(
        ...mapKeys.map((key) => {
          return map.get(key);
        })
      );
    });

    providersMap.forEach((map) => {
      const mapKeys = [...map.keys()];
      instanceWrappers.push(
        ...(mapKeys.map((key) => {
          return map.get(key);
        }) as any)
      );
    });

    instanceWrappers = instanceWrappers.filter((i) => !!i.instance);

    // find the handlers marked with @Subscribe
    return instanceWrappers
      .map((data) => {
        const { instance } = data;
        const instancePrototype = Object.getPrototypeOf(instance);

        return this.metadataScanner.scanFromPrototype(
          instance,
          instancePrototype,
          (method) =>
            this.exploreMethodMetadata(instance, instancePrototype, method)
        );
      })
      .reduce((prev, curr) => {
        return prev.concat(curr);
      }, []);
  }

  public exploreMethodMetadata(
    instance: object,
    instancePrototype: Controller,
    methodKey: string
  ) {
    const targetCallback = instancePrototype[methodKey];
    const handler = Reflect.getMetadata(
      ASK_SERVICE_SUBSCRIBER,
      targetCallback
    );
    if (handler == null) {
      return null;
    }
    handler.instance = instance;
    return handler;
  }
}

export interface ISubscribeMetadata {
  topic: string;
  target: Object;
  instance?: Object;
  methodName: string;
  callback: Function;
}

export const AskSubscribe = (topic: string): any => {
  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    SetMetadata<string, ISubscribeMetadata>(ASK_SERVICE_SUBSCRIBER, {
      topic,
      target,
      methodName: propertyKey,
      callback: descriptor.value,
    })(target, propertyKey, descriptor);
  };
};

@Module({
  imports: [],
  providers: [MetadataScanner, AskProvider, AskServiceSubscriberExplorer],
  exports: [AskProvider],
})
export class AskServiceModule implements OnModuleInit {
  constructor(
    private readonly explorer: AskServiceSubscriberExplorer,
    private readonly askService: AskProvider
  ) { }

  async onModuleInit() {
    // find everything marked with @Subscribe
    const subscribers = this.explorer.explore();

    // set up subscriptions
    for (const subscriber of subscribers) {
      await this.askService.subscribe(
        subscriber.topic,
        async (id, ...args) => {
          const data = await subscriber.callback.apply(subscriber.instance, args);
          if (data !== undefined) {
            this.askService.emit(id, data);
          }
        }
      );
    }
  }
}
