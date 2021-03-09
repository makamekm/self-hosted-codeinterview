import { useContext } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import { QuestionnaireSearchService } from "~/services/QuestionnaireSearchService";
import { LanguageName } from "~/dto/language.dto";
import { observer } from "mobx-react";
import { UserService } from "~/services/UserService";
import { useRouter } from "next/router";

export const QuestionnaireSearchPanel = observer(() => {
  const router = useRouter();
  const userService = useContext(UserService);
  const service = useContext(QuestionnaireSearchService);
  const onInputChange = (event) => {
    service.filter.name = event.target.value;
    if (service.filter.name) {
      service.search();
    }
  };
  const onSelectQuestion = (id) => {
    router.push({ pathname: "/questionnaire/[id]", query: { id } });
  };
  const onSelect = (value: string) => {
    if (value != null) {
      service.filter.name = "";
      if (value.startsWith("L@")) {
        value = value.replace("L@", "");
        service.filter.language = value;
      } else if (value.startsWith("U@")) {
        value = value.replace("U@", "");
        service.filter.username = value;
      } else {
        onSelectQuestion(value);
      }
    }
  };
  const onCreateQuestionnaire = () => {
    router.push({ pathname: "/questionnaire-create" });
  };
  return (
    <div className="w-full flex-col justify-items-stretch items-stretch space-y-2">
      {!!userService.user && (
        <button
          onClick={onCreateQuestionnaire}
          className="w-full bg-gray-600 hover:bg-gray-500 focus:outline-none focus:bg-gray-500 text-white text-sm px-4 py-2 rounded-sm transition-colors duration-200"
        >
          Create Questionarie
        </button>
      )}

      <Combobox onSelect={onSelect}>
        <ComboboxInput
          onKeyUp={(e) => {
            if (![13, 37, 39, 38, 40].includes(e.keyCode)) {
              service.search();
            }
          }}
          onChange={onInputChange}
          value={service.filter.name}
          placeholder="Search..."
          className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
        />
        {!service.isLoading && (
          <ComboboxPopover className="w-full text-gray-800 rounded-md mt-2">
            {service.questionnairePersonalList.length +
              service.questionnaireList.length +
              service.userList.length +
              service.languages.length ===
              0 && (
              <div className="text-center px-4 py-2 font-semibold text-sm">
                No results 😞
              </div>
            )}

            {service.languages.length > 0 && (
              <ComboboxList>
                <div className="px-4 py-2 font-mono font-semibold">
                  Languages:
                </div>
                {service.languages.map((language) => (
                  <ComboboxOption key={language} value={"L@" + language}>
                    {LanguageName[language]}
                  </ComboboxOption>
                ))}
              </ComboboxList>
            )}

            {service.userList.length > 0 && (
              <ComboboxList>
                <div className="px-4 py-2 font-mono font-semibold">Users:</div>
                {service.userList.map((user) => (
                  <ComboboxOption key={user._id} value={"U@" + user.username}>
                    {user.username}
                  </ComboboxOption>
                ))}
              </ComboboxList>
            )}

            {service.questionnairePersonalList.length > 0 && (
              <ComboboxList>
                <div className="px-4 py-2 font-mono font-semibold">
                  Personal Questionnaires:
                </div>
                {service.questionnairePersonalList.map((questionnaire) => (
                  <ComboboxOption
                    className="px-4 py-2 font-mono"
                    key={questionnaire._id}
                    value={questionnaire._id}
                  >
                    {questionnaire.name}
                  </ComboboxOption>
                ))}
              </ComboboxList>
            )}

            {service.questionnaireList.length > 0 && (
              <ComboboxList>
                <div className="px-4 py-2 font-mono font-semibold">
                  All Questionnaires:
                </div>
                {service.questionnaireList.map((questionnaire) => (
                  <ComboboxOption
                    className="px-4 py-2 font-mono"
                    key={questionnaire._id}
                    value={questionnaire._id}
                  >
                    {questionnaire.name}
                  </ComboboxOption>
                ))}
              </ComboboxList>
            )}
          </ComboboxPopover>
        )}
      </Combobox>
      {!!(service.filter.language || service.filter.username) && (
        <div className="flex flex-wrap flex-row space-x-2">
          {!!service.filter.language && (
            <div className="flex text-sm justify-stretch items-stretch">
              <div className="bg-gray-400 text-gray-600 px-2 py-1 rounded-l-md">
                Language
              </div>
              <div className="bg-gray-500 text-green-100 px-2 py-1">
                {LanguageName[service.filter.language]}
              </div>
              <div
                onClick={() => {
                  service.filter.language = null;
                  service.search();
                }}
                className="bg-red-900 text-green-100 px-2 py-1 rounded-r-md flex justify-center items-center cursor-pointer hover:bg-red-500 focus:bg-red-500 transition-colors duration-200"
              >
                <svg
                  height="16px"
                  width="16px"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m256 0c-141.164062 0-256 114.835938-256 256s114.835938 256 256 256 256-114.835938 256-256-114.835938-256-256-256zm0 0"
                    fill="#f44336"
                  />
                  <path
                    d="m350.273438 320.105469c8.339843 8.34375 8.339843 21.824219 0 30.167969-4.160157 4.160156-9.621094 6.25-15.085938 6.25-5.460938 0-10.921875-2.089844-15.082031-6.25l-64.105469-64.109376-64.105469 64.109376c-4.160156 4.160156-9.621093 6.25-15.082031 6.25-5.464844 0-10.925781-2.089844-15.085938-6.25-8.339843-8.34375-8.339843-21.824219 0-30.167969l64.109376-64.105469-64.109376-64.105469c-8.339843-8.34375-8.339843-21.824219 0-30.167969 8.34375-8.339843 21.824219-8.339843 30.167969 0l64.105469 64.109376 64.105469-64.109376c8.34375-8.339843 21.824219-8.339843 30.167969 0 8.339843 8.34375 8.339843 21.824219 0 30.167969l-64.109376 64.105469zm0 0"
                    fill="white"
                  />
                </svg>
              </div>
            </div>
          )}
          {!!service.filter.username && (
            <div className="flex text-sm justify-stretch items-stretch">
              <div className="bg-gray-400 text-gray-600 px-2 py-1 rounded-l-md">
                Username
              </div>
              <div className="bg-gray-500 text-green-100 px-2 py-1">
                {service.filter.username}
              </div>
              <div
                onClick={() => {
                  service.filter.username = null;
                  service.search();
                }}
                className="bg-red-900 text-green-100 px-2 py-1 rounded-r-md flex justify-center items-center cursor-pointer hover:bg-red-500 focus:bg-red-500 transition-colors duration-200"
              >
                <svg
                  height="16px"
                  width="16px"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m256 0c-141.164062 0-256 114.835938-256 256s114.835938 256 256 256 256-114.835938 256-256-114.835938-256-256-256zm0 0"
                    fill="#f44336"
                  />
                  <path
                    d="m350.273438 320.105469c8.339843 8.34375 8.339843 21.824219 0 30.167969-4.160157 4.160156-9.621094 6.25-15.085938 6.25-5.460938 0-10.921875-2.089844-15.082031-6.25l-64.105469-64.109376-64.105469 64.109376c-4.160156 4.160156-9.621093 6.25-15.082031 6.25-5.464844 0-10.925781-2.089844-15.085938-6.25-8.339843-8.34375-8.339843-21.824219 0-30.167969l64.109376-64.105469-64.109376-64.105469c-8.339843-8.34375-8.339843-21.824219 0-30.167969 8.34375-8.339843 21.824219-8.339843 30.167969 0l64.105469 64.109376 64.105469-64.109376c8.34375-8.339843 21.824219-8.339843 30.167969 0 8.339843 8.34375 8.339843 21.824219 0 30.167969l-64.109376 64.105469zm0 0"
                    fill="white"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}

      {service.isLoading ? (
        <div className="loader mt-4" />
      ) : (
        <div className="pt-2">
          {service.questionnairePersonalList.map((questionnaire) => {
            return (
              <div
                key={questionnaire._id}
                onClick={() => onSelectQuestion(questionnaire._id)}
                className="widget mt-2 w-full p-4 rounded-lg bg-gray-900 focus-within:bg-gray-700 hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-col">
                    <div className="text-xs uppercase font-light text-gray-500">
                      {LanguageName[questionnaire.language]}
                    </div>
                    <div className="text-xl font-bold">
                      {questionnaire.name}
                    </div>
                  </div>
                  {/* <svg
                      className="stroke-current text-gray-500"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      viewbox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg> */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
