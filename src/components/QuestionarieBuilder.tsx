import { observer, useLocalObservable } from "mobx-react";
import { v4 as uuidv4 } from "uuid";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-scss";
import "ace-builds/src-noconflict/theme-dracula";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useContext } from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@reach/disclosure";

import { Language, LanguageName, LanguageType } from "~/dto/language.dto";
import { reorder, move } from "~/utils/dnd.util";
import { QuestionnaireBuilderService } from "~/services/QuestionnaireBuilderService";
import {
  QuestionnaireSectionDto,
  QuestionnaireSectionQuestionDto,
} from "~/dto/questionnaire.dto";
import { Toggle } from "./Toggle";
import { WarnDialog } from "./WarnAlert";

const Question = observer(
  ({
    section,
    question,
    provided,
    snapshot,
    index,
    state,
  }: {
    section: QuestionnaireSectionDto;
    question: QuestionnaireSectionQuestionDto;
    provided;
    snapshot;
    index: number;
    state: IBuilderState;
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
            {!service.readOnly && (
              <WarnDialog
                onApprove={() => {
                  section.questions.splice(index, 1);
                }}
                text="Removing the question cannot be reverted."
              >
                {({ open }) => (
                  <div
                    onClick={open}
                    className="flex flex-row items-center px-3 py-1 font-mono font-thin text-sm cursor-pointer rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
                  >
                    Remove
                  </div>
                )}
              </WarnDialog>
            )}
          </div>
          <div className="w-full text-center font-semibold text-base">
            <input
              readOnly={service.readOnly}
              value={question.name}
              placeholder="Question Name"
              className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
              onChange={(e) => (question.name = e.currentTarget.value)}
            />
          </div>
          {(!service.readOnly || !!question.description) && (
            <ReactQuill
              readOnly={service.readOnly}
              theme={"bubble"}
              placeholder="Question Description"
              value={question.description || ""}
              onChange={(value) => (question.description = value)}
            />
          )}
          <Listbox
            disabled={service.readOnly}
            className="w-full"
            value={question.language || service.questionnaire.language}
            onChange={(language) => {
              if (!service.readOnly) {
                question.language = language as Language;
                if (question.language === service.questionnaire.language) {
                  delete question.language;
                }
              }
            }}
          >
            {Object.keys(LanguageName).map((language) => (
              <ListboxOption key={language} value={language}>
                {LanguageName[language]}
              </ListboxOption>
            ))}
          </Listbox>
          <AceEditor
            setOptions={{ useWorker: false }}
            readOnly={service.readOnly}
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
    state,
  }: {
    section: QuestionnaireSectionDto;
    provided;
    snapshot;
    index: number;
    state: IBuilderState;
  }) => {
    const service = useContext(QuestionnaireBuilderService);

    const props = state.isDragQuestions ? {} : { ...provided.draggableProps, style: provided.draggableProps.style };
    const propsDnd = state.isDragQuestions ? {} : { ...provided.dragHandleProps };

    return (
      <div className="w-full" ref={provided.innerRef} {...props}>
        <Disclosure open={state.sectionIsOpen[section.id] || false} onChange={() => state.sectionIsOpen[section.id] = !state.sectionIsOpen[section.id]}>
          <div className="rounded-md shadow-xl bg-gray-700">
            <div
              className="flex flex-row items-stretch space-x-2 px-2 py-2 w-full text-center font-semibold text-base hover:bg-gray-500 focus:bg-gray-500 focus:outline-none rounded-sm transition-colors duration-200"
              {...propsDnd}
            >
              <input
                readOnly={service.readOnly}
                value={section.name}
                placeholder="Section Name"
                className="flex-1 py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 transition-colors duration-200"
                onChange={(e) => (section.name = e.currentTarget.value)}
              />
              {!service.readOnly && <WarnDialog
                onApprove={() => {
                  service.questionnaire.sections.splice(index, 1);
                }}
                text="Removing the question cannot be reverted."
              >
                {({ open }) => (
                  <div
                    onClick={open}
                    className="flex flex-row items-center px-3 py-1 font-mono font-thin text-sm cursor-pointer rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
                  >
                    Remove
                  </div>
                )}
              </WarnDialog>}
              {!service.readOnly && <div
                onClick={() => {
                  if (index !== 0)
                    reorder(service.questionnaire.sections, index, index - 1);
                }}
                className="flex flex-row items-center px-3 py-1 font-mono font-thin text-sm cursor-pointer rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
              >
                Up
              </div>}
              {!service.readOnly && <div
                onClick={() => {
                  if (index + 1 !== service.questionnaire.sections.length)
                    reorder(service.questionnaire.sections, index, index + 1);
                }}
                className="flex flex-row items-center px-3 py-1 font-mono font-thin text-sm cursor-pointer rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
              >
                Down
              </div>}
              <DisclosureButton className="flex flex-row items-center px-3 py-1 font-mono font-thin text-sm cursor-pointer rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200 outline-none focus:outline-none">
                {state.sectionIsOpen[section.id] ? "- Hide" : "+ Show"}
              </DisclosureButton>
            </div>
            <DisclosurePanel className="border-gray-600 border-t space-y-8 px-2 py-2">
              {(!service.readOnly || !!section.description) && (
                <ReactQuill
                  readOnly={service.readOnly}
                  theme={"bubble"}
                  placeholder="Section Description"
                  value={section.description || ""}
                  onChange={(value) => (section.description = value)}
                />
              )}

              {section.questions.length > 0 && (
                <div className="w-full flex flex-col space-y-4">
                  {section.questions.map((question, index) => (
                    <Draggable
                      isDragDisabled={!state.isDragQuestions || service.readOnly}
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
                          state={state}
                        />
                      )}
                    </Draggable>
                  ))}
                </div>
              )}

              {provided.placeholder}

              {!service.readOnly && (
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
              )}
            </DisclosurePanel>
          </div>
        </Disclosure>
      </div>
    );
  }
);

interface IBuilderState {
  isDragQuestions: boolean;
  sectionIsOpen: { [id: string]: boolean },
  isShowAll: boolean;
}

export const QuestionarieBuilder = observer(() => {
  const service = useContext(QuestionnaireBuilderService);
  const state: IBuilderState = useLocalObservable(() => ({
    isDragQuestions: false,
    sectionIsOpen: {} as { [id: string]: boolean },
    get isShowAll() {
      if (!service.questionnaire) {
        return false;
      }

      for (let section of service.questionnaire.sections) {
        if (state.sectionIsOpen[section.id]) {
          return true;
        }
      }

      return false;
    }
  }));

  const onToggleShowSections = () => {
    const isShowAll = state.isShowAll;
    if (isShowAll) {
      state.sectionIsOpen = {};
    } else {
      service.questionnaire.sections.forEach((section) => {
        state.sectionIsOpen[section.id] = true;
      });
    }
  };

  const onDragEnd = (result) => {
    if (service.readOnly) {
      return;
    }

    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (!state.isDragQuestions) {
      reorder(service.questionnaire.sections, source.index, destination.index);
    } else {
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
        readOnly={service.readOnly}
        value={service.questionnaire.name}
        placeholder="Questionnaire Name"
        className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
        onChange={(e) => (service.questionnaire.name = e.currentTarget.value)}
      />

      <Listbox
        className="w-full"
        value={service.questionnaire.language}
        onChange={(language) =>
          !service.readOnly &&
          (service.questionnaire.language = language as Language)
        }
        disabled={service.readOnly}
      >
        {Object.keys(LanguageName).map((language) => (
          <ListboxOption key={language} value={language}>
            {LanguageName[language]}
          </ListboxOption>
        ))}
      </Listbox>

      {!service.readOnly && (
        <div className="flex flex-row items-center space-x-2">
          <Toggle
            checked={service.questionnaire.isPublic}
            onChange={(value) => (service.questionnaire.isPublic = value)}
          />
          <div>Is Public</div>
        </div>
      )}

      <div className="flex flex-row w-full justify-end items-center space-x-4">
        {!service.readOnly && <div className="flex flex-row items-center space-x-2 text-sm">
          <Toggle
            checked={state.isDragQuestions}
            onChange={(value) => (state.isDragQuestions = value)}
          />
          <div>Drag {state.isDragQuestions ? "Questions" : "Sections"}</div>
        </div>}

        <button
          onClick={onToggleShowSections}
          className="cursor-pointer outline-none focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 bg-gray-500 rounded-lg font-medium text-white text-xs text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-gray-600"
        >
          {state.isShowAll ? "HIDE" : "SHOW"} All
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {state.isDragQuestions && service.questionnaire.sections.map((section, index) => (
          <Droppable droppableId={section.id} key={section.id}>
            {(provided, snapshot) => (
              <Section
                key={section.id}
                index={index}
                section={section}
                provided={provided}
                snapshot={snapshot}
                state={state}
              />
            )}
          </Droppable>
        ))}

        {!state.isDragQuestions && <Droppable droppableId={"-1"}>
          {(provided, snapshot) => (
            <div className="relative w-full space-y-4" ref={provided.innerRef}>
              {service.questionnaire.sections.map((section, index) => (
                <Draggable
                  isDragDisabled={state.isDragQuestions || service.readOnly}
                  draggableId={section.id}
                  index={index}
                  key={section.id}
                >
                  {(provided, snapshot) => (
                    <Section
                      key={section.id}
                      index={index}
                      section={section}
                      provided={provided}
                      snapshot={snapshot}
                      state={state}
                    />
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>}
      </DragDropContext>

      {!service.readOnly && (
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
      )}
    </div>
  );
});

export default QuestionarieBuilder;
