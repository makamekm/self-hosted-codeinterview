import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { debounce } from "ts-debounce";
import { LanguageName } from "~/dto/language.dto";
import { UserDto } from "~/dto/user.dto";
import { QuestionnaireDto } from "~/dto/questionnaire.dto";

export const QuestionnaireSearchService = createService(
  () => {
    const service = useLocalObservable(() => ({
      questionnairePersonalList: [] as QuestionnaireDto[],
      questionnaireList: [] as QuestionnaireDto[],
      get list(): QuestionnaireDto[] {
        const arr = [
          ...service.questionnairePersonalList,
          ...service.questionnaireList,
        ];
        return arr.reduce((a, i) => {
          if (!a.find((k) => k._id === i._id)) {
            a.push(i);
          }
          return a;
        }, []);
      },
      userList: [] as UserDto[],
      get languages() {
        return service.filter.name
          ? Object.keys(LanguageName).filter((name) =>
              name
                .toLocaleLowerCase()
                .includes(service.filter.name.toLocaleLowerCase())
            )
          : [];
      },
      filter: {
        language: null,
        user: null as UserDto,
        name: "",
      },
      _debounceSearch: null as () => void,
      isLoading: false,
      syncQuestionnaire: null as () => void,
      async _search() {
        service.userList = [];
        service.questionnaireList = [];
        service.questionnairePersonalList = [];
        await Promise.all([
          service.filter.name &&
            fetch(`/api/user/all?name=${service.filter.name}&limit=${5}`)
              .then((res) => res.json())
              .then((users) => {
                service.userList = users;
              }),
          (service.filter.name ||
            service.filter.language ||
            service.filter.user) &&
            fetch(
              `/api/questionnaire/all?name=${service.filter.name}&language=${
                service.filter.language || ""
              }&limit=${10}&userId=${service.filter.user?._id || ""}`
            )
              .then((res) => res.json())
              .then((list) => {
                service.questionnaireList = list;
              }),
          !service.filter.user &&
            fetch(
              `/api/questionnaire/personal?name=${
                service.filter.name
              }&language=${service.filter.language || ""}&limit=${20}`
            )
              .then((res) => res.json())
              .then((list) => {
                service.questionnairePersonalList = list;
              }),
        ]);

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
    service._debounceSearch = debounce(service._search, 500);
    React.useEffect(() => {
      if (global.window) service.search();
    });
  }
);
