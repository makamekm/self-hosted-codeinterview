import { Injectable, Module, OnModuleInit, SetMetadata } from "@nestjs/common";
import { Controller, Provider } from "@nestjs/common/interfaces";
import { MetadataScanner, ModulesContainer } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { RedisService } from "nestjs-redis";

const EVENT_SERVICE_SUBSCRIBER = "EVENT_SERVICE_SUBSCRIBER";

@Injectable()
export class EventServiceSubscriberExplorer {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner
  ) {}

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
      EVENT_SERVICE_SUBSCRIBER,
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

export const EventSubscribe = (topic: string): any => {
  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    SetMetadata<string, ISubscribeMetadata>(EVENT_SERVICE_SUBSCRIBER, {
      topic,
      target,
      methodName: propertyKey,
      callback: descriptor.value,
    })(target, propertyKey, descriptor);
  };
};

@Injectable()
export class EventProvider {
  constructor(private readonly redisService: RedisService) {}

  subscribers: (() => void)[];

  async emit(name: string, ...args) {
    await this.redisService.getClient().emit(name, ...args);
  }

  subscribe(topic: string, callback) {
    this.redisService.getClient().on(topic, callback);
  }
}

@Module({
  imports: [],
  providers: [MetadataScanner, EventProvider, EventServiceSubscriberExplorer],
  exports: [EventProvider],
})
export class EventServiceModule implements OnModuleInit {
  constructor(
    private readonly explorer: EventServiceSubscriberExplorer,
    private readonly eventService: EventProvider
  ) {}

  async onModuleInit() {
    // find everything marked with @Subscribe
    const subscribers = this.explorer.explore();

    // set up subscriptions
    for (const subscriber of subscribers) {
      await this.eventService.subscribe(
        subscriber.topic,
        subscriber.callback.bind(subscriber.instance)
      );
    }
  }
}
