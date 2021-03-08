import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { debounce } from "ts-debounce";
import { Language, LanguageName } from "~/dto/language.dto";
import { UserDto } from "~/dto/user.dto";

export const QuestionnaireSearchService = createService(
  () => {
    const service = useLocalObservable(() => ({
      questionnairePersonalList: [] as {
        id: string;
        name: string;
        language: Language;
      }[],
      questionnaireList: [] as {
        id: string;
        name: string;
        language: Language;
      }[],
      userList: [] as UserDto[],
      get languages() {
        return Object.keys(LanguageName).filter((name) =>
          name
            .toLocaleLowerCase()
            .includes(service.filter.name.toLocaleLowerCase())
        );
      },
      filter: {
        language: null,
        username: "",
        name: "",
        limit: 5,
      },
      _debounceSearch: null as () => void,
      isLoading: false,
      syncQuestionnaire: null as () => void,
      async _search() {
        const [
          users,
          questionnaireList,
          questionnairePersonalList,
        ] = await Promise.all([
          fetch(
            `/api/user/all?name=${service.filter.name}&limit=${service.filter.limit}`
          ).then((res) => res.json()),
          fetch(
            `/api/questionnaire/all?name=${service.filter.name}&language=${service.filter.language}&limit=${service.filter.limit}&username=${service.filter.username}`
          ).then((res) => res.json()),
          fetch(
            `/api/questionnaire/personal?name=${service.filter.name}&language=${service.filter.language}&limit=${service.filter.limit}`
          ).then((res) => res.json()),
        ]);

        service.userList = users;
        service.questionnaireList = questionnaireList;
        service.questionnairePersonalList = questionnairePersonalList;
        service.isLoading = false;
      },
      async search() {
        service.isLoading = true;
        await service._debounceSearch();
      },
    }));
    return service;
  },
  (service) => {
    service._debounceSearch = debounce(service._search, 100);
    React.useEffect(() => {
      if (global.window) service.search();
    });
  }
);
