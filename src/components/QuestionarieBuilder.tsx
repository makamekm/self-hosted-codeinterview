import { observer } from "mobx-react";
import classNames from "classnames";
import { useContext } from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";
import { GradeDto } from "~/dto/result.questionnaire.dto";
import { Language, LanguageName } from "~/dto/language.dto";
import { QuestionnaireBuilderService } from "~/services/QuestionnaireBuilderService";

export const QuestionarieBuilder = observer(() => {
  const service = useContext(QuestionnaireBuilderService);

  if (service.isLoading) {
    return <div className="loader mt-4" />;
  }

  if (!service.questionnaire) {
    return <div>Error!</div>;
  }

  return (
    <div className="w-full space-y-4">
      <input
        value={service.questionnaire.name}
        placeholder="Questionnaire Name"
        className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
        onChange={(e) => (service.questionnaire.name = e.currentTarget.value)}
      />

      <Listbox
        className="w-full"
        value={service.questionnaire.language}
        onChange={(language) =>
          (service.questionnaire.language = language as Language)
        }
      >
        {Object.keys(LanguageName).map((language) => (
          <ListboxOption key={language} value={language}>
            {LanguageName[language]}
          </ListboxOption>
        ))}
      </Listbox>

      {service.questionnaire.sections.map((section, i) => (
        <div className="w-full" key={section.id || i}>
          <div className="rounded-md shadow-xl bg-gray-700">
            <div className="px-2 py-2 w-full text-center font-semibold text-base hover:bg-gray-500 focus:bg-gray-500 focus:outline-none rounded-sm transition-colors duration-200">
              <input
                value={section.name}
                placeholder="Section Name"
                className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
                onChange={(e) => (section.name = e.currentTarget.value)}
              />
            </div>
            <div className="border-gray-600 border-t space-y-8 px-2 py-2">
              <input
                value={section.description || ""}
                placeholder="Section Description"
                className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
                onChange={(e) => (section.description = e.currentTarget.value)}
              />

              {section.questions.length > 0 && (
                <div className="w-full flex flex-col space-y-8">
                  {section.questions.map((question, k) => (
                    <div className="w-full" key={question.id || k}>
                      <div className="rounded-sm space-y-2">
                        <div className="w-full text-center font-semibold text-base hover:bg-gray-500 focus:bg-gray-500 focus:outline-none rounded-sm transition-colors duration-200">
                          <input
                            value={question.name}
                            placeholder="Question Name"
                            className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
                            onChange={(e) =>
                              (question.name = e.currentTarget.value)
                            }
                          />
                        </div>
                        <input
                          value={question.description || ""}
                          placeholder="Question Description"
                          className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
                          onChange={(e) =>
                            (question.description = e.currentTarget.value)
                          }
                        />
                        <input
                          value={question.code || ""}
                          placeholder="Question Code"
                          className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
                          onChange={(e) =>
                            (question.code = e.currentTarget.value)
                          }
                        />
                        <Listbox
                          className="w-full"
                          value={
                            question.language || service.questionnaire.language
                          }
                          onChange={(language) =>
                            (question.language = language as Language)
                          }
                        >
                          {Object.keys(LanguageName).map((language) => (
                            <ListboxOption key={language} value={language}>
                              {LanguageName[language]}
                            </ListboxOption>
                          ))}
                        </Listbox>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() =>
                  section.questions.push({
                    name: "New Question",
                  })
                }
                className="w-full bg-gray-600 hover:bg-gray-500 focus:outline-none focus:bg-gray-500 text-white text-sm px-4 py-2 rounded-sm transition-colors duration-200"
              >
                + Add Question
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() =>
          service.questionnaire.sections.push({
            name: "New Section",
            questions: [],
          })
        }
        className="w-full bg-gray-600 hover:bg-gray-500 focus:outline-none focus:bg-gray-500 text-white text-sm px-4 py-2 rounded-sm transition-colors duration-200"
      >
        + Add Section
      </button>
    </div>
  );
});
