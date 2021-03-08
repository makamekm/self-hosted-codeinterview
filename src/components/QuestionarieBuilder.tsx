import { observer } from "mobx-react";
import { v4 as uuidv4 } from "uuid";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-dracula";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useContext } from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";
import { Language, LanguageName, LanguageType } from "~/dto/language.dto";
import { reorder, move } from "~/utils/dnd.util";
import { QuestionnaireBuilderService } from "~/services/QuestionnaireBuilderService";
import {
  QuestionnaireSectionDto,
  QuestionnaireSectionQuestionDto,
} from "~/dto/questionnaire.dto";

const Question = observer(
  ({
    section,
    question,
    provided,
    snapshot,
    index,
  }: {
    section: QuestionnaireSectionDto;
    question: QuestionnaireSectionQuestionDto;
    provided;
    snapshot;
    index: number;
  }) => {
    const service = useContext(QuestionnaireBuilderService);

    return (
      <div
        className="w-full rounded-md shadow-xl bg-gray-600 p-2"
        ref={provided.innerRef}
        {...provided.draggableProps}
        style={provided.draggableProps.style}
      >
        <div className="rounded-sm space-y-2">
          <div
            className="flex flex-row items-stretch"
            {...provided.dragHandleProps}
          >
            <div className="flex-1 px-3 py-1 font-mono font-semibold text-sm">
              Question #{index + 1}
            </div>
            <div
              onClick={() => {
                section.questions.splice(index, 1);
              }}
              className="flex flex-row items-center px-3 py-1 font-mono font-thin text-sm cursor-pointer rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
            >
              Remove
            </div>
          </div>
          <div className="w-full text-center font-semibold text-base">
            <input
              value={question.name}
              placeholder="Question Name"
              className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
              onChange={(e) => (question.name = e.currentTarget.value)}
            />
          </div>
          <input
            value={question.description || ""}
            placeholder="Question Description"
            className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
            onChange={(e) => (question.description = e.currentTarget.value)}
          />
          <Listbox
            className="w-full"
            value={question.language || service.questionnaire.language}
            onChange={(language) => (question.language = language as Language)}
          >
            {Object.keys(LanguageName).map((language) => (
              <ListboxOption key={language} value={language}>
                {LanguageName[language]}
              </ListboxOption>
            ))}
          </Listbox>
          <AceEditor
            mode={
              LanguageType[question.language || service.questionnaire.language]
            }
            theme="dracula"
            minLines={2}
            maxLines={Infinity}
            className="min-w-full max-w-full min-h-full max-h-full rounded-lg"
            value={question.code || ""}
            onChange={(value, event) => {
              question.code = value;
            }}
          />
        </div>
      </div>
    );
  }
);

const Section = observer(
  ({
    index,
    section,
    provided,
    snapshot,
  }: {
    section: QuestionnaireSectionDto;
    provided;
    snapshot;
    index: number;
  }) => {
    const service = useContext(QuestionnaireBuilderService);

    return (
      <div className="w-full" ref={provided.innerRef}>
        <div className="rounded-md shadow-xl bg-gray-700">
          <div className="flex flex-row items-stretch space-x-2 px-2 py-2 w-full text-center font-semibold text-base hover:bg-gray-500 focus:bg-gray-500 focus:outline-none rounded-sm transition-colors duration-200">
            <input
              value={section.name}
              placeholder="Section Name"
              className="flex-1 py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 transition-colors duration-200"
              onChange={(e) => (section.name = e.currentTarget.value)}
            />
            <div
              onClick={() => {
                service.questionnaire.sections.splice(index, 1);
              }}
              className="flex flex-row items-center px-3 py-1 font-mono font-thin text-sm cursor-pointer rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
            >
              Remove
            </div>
            <div
              onClick={() => {
                if (index !== 0)
                  reorder(service.questionnaire.sections, index, index - 1);
              }}
              className="flex flex-row items-center px-3 py-1 font-mono font-thin text-sm cursor-pointer rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
            >
              Up
            </div>
            <div
              onClick={() => {
                if (index + 1 !== service.questionnaire.sections.length)
                  reorder(service.questionnaire.sections, index, index + 1);
              }}
              className="flex flex-row items-center px-3 py-1 font-mono font-thin text-sm cursor-pointer rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
            >
              Down
            </div>
          </div>
          <div className="border-gray-600 border-t space-y-8 px-2 py-2">
            <input
              value={section.description || ""}
              placeholder="Section Description"
              className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
              onChange={(e) => (section.description = e.currentTarget.value)}
            />

            {section.questions.length > 0 && (
              <div className="w-full flex flex-col space-y-4">
                {section.questions.map((question, index) => (
                  <Draggable
                    draggableId={question.id}
                    index={index}
                    key={question.id}
                  >
                    {(provided, snapshot) => (
                      <Question
                        index={index}
                        question={question}
                        provided={provided}
                        snapshot={snapshot}
                        section={section}
                        key={question.id}
                      />
                    )}
                  </Draggable>
                ))}
              </div>
            )}

            {provided.placeholder}

            <button
              onClick={() =>
                section.questions.push({
                  id: uuidv4(),
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
    );
  }
);

export const QuestionarieBuilder = observer(() => {
  const service = useContext(QuestionnaireBuilderService);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    const sourceArr = service.questionnaire.sections.find(
      (s) => s.id === source.droppableId
    );
    const destinationArr = service.questionnaire.sections.find(
      (s) => s.id === destination.droppableId
    );

    if (source.droppableId === destination.droppableId) {
      reorder(sourceArr.questions, source.index, destination.index);
    } else {
      move(sourceArr.questions, destinationArr.questions, source, destination);
    }
  };

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

      <DragDropContext onDragEnd={onDragEnd}>
        {service.questionnaire.sections.map((section, index) => (
          <Droppable droppableId={section.id} key={section.id}>
            {(provided, snapshot) => (
              <Section
                key={section.id}
                index={index}
                section={section}
                provided={provided}
                snapshot={snapshot}
              />
            )}
          </Droppable>
        ))}
      </DragDropContext>

      <button
        onClick={() =>
          service.questionnaire.sections.push({
            id: uuidv4(),
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

export default QuestionarieBuilder;
