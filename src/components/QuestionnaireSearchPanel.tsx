import { useContext } from "react";
import { QuestionnaireSearchService } from "~/services/QuestionnaireSearchService";
import { LanguageName } from "~/dto/language.dto";
import { observer } from "mobx-react";

export const QuestionnaireSearchPanel = observer(
  ({
    onSelect,
    addon,
  }: {
    onSelect: (id: string) => void;
    addon?: JSX.Element;
  }) => {
    const service = useContext(QuestionnaireSearchService);
    const onInputChange = (event) => {
      service.filter.name = event.target.value;
      service.search();
    };
    return (
      <div className="w-full flex-col justify-items-stretch items-stretch space-y-2">
        <div className="flex flex-row justify-between items-stretch space-x-2">
          <input
            onChange={onInputChange}
            value={service.filter.name}
            placeholder="Search..."
            type="search"
            className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
          />
          {addon}
        </div>

        {!!(service.filter.language || service.filter.user) && (
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
            {!!service.filter.user && (
              <div className="flex text-sm justify-stretch items-stretch">
                <div className="bg-gray-400 text-gray-600 px-2 py-1 rounded-l-md">
                  User
                </div>
                <div className="bg-gray-500 text-green-100 px-2 py-1">
                  {service.filter.user.username}
                </div>
                <div
                  onClick={() => {
                    service.filter.user = null;
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
          <div className="py-4">
            <div className="loader" />
          </div>
        ) : (
          <div className="space-y-2">
            {service.questionnairePersonalList.length +
              service.questionnaireList.length +
              service.userList.length +
              service.languages.length ===
              0 && (
              <div className="text-center px-4 py-2 font-semibold text-sm">
                No results 😞
              </div>
            )}

            {(service.languages.length > 0 || service.userList.length > 0) && (
              <div className="flex flex-row w-full space-x-2">
                {service.languages.length > 0 && (
                  <div className="flex-1 space-y-2">
                    {/* <div className="text-center px-4 py-2 font-semibold text-sm">
                    Languages
                  </div> */}
                    {service.languages.map((language) => (
                      <div
                        onClick={() => {
                          service.filter.language = language;
                          service.filter.name = "";
                          service.search();
                        }}
                        key={language}
                        className="cursor-pointer w-full text-sm p-4 rounded-lg bg-gray-900 focus-within:bg-gray-700 hover:bg-gray-700 transition-colors duration-200"
                      >
                        {LanguageName[language]}
                      </div>
                    ))}
                  </div>
                )}
                {service.userList.length > 0 && (
                  <div className="flex-1 space-y-2">
                    {/* <div className="text-center px-4 py-2 font-semibold text-sm">
                    Users
                  </div> */}
                    {service.userList
                      .filter((u) => u._id !== service.filter.user?._id)
                      .map((user) => (
                        <div
                          onClick={() => {
                            service.filter.user = user;
                            service.filter.name = "";
                            service.search();
                          }}
                          key={user._id}
                          className="cursor-pointer text-sm w-full p-4 rounded-lg bg-gray-900 focus-within:bg-gray-700 hover:bg-gray-700 transition-colors duration-200"
                        >
                          {user.username}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {service.list.map((questionnaire) => {
              return (
                <div
                  key={questionnaire._id}
                  onClick={() => onSelect(questionnaire._id)}
                  className="cursor-pointer w-full p-4 rounded-lg bg-gray-900 focus-within:bg-gray-700 hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col w-full space-y-2">
                      <div className="w-full flex flex-row justify-between items-between">
                        <div className="text-xs uppercase font-light text-gray-500">
                          {LanguageName[questionnaire.language]}
                        </div>
                        <div className="text-xs font-light text-gray-400">
                          {questionnaire.user?.username}
                        </div>
                      </div>
                      <div className="text-xl font-bold">
                        {questionnaire.name}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
