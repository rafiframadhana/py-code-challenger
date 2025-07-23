import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { Play, RotateCcw, Terminal } from "lucide-react";
import { Tooltip } from "react-tooltip";
import type { Challenge } from "../data/challenges";
import ChallengeSuccessModal from "./ChallengeSuccessModal";
import { useDeviceType } from "../hooks/useDeviceType";
import { findNextUncompletedChallenge } from "../utils/challengeUtils";
import { executePythonCode, runPythonCode, initializePyodide, type PythonTestResult } from "../utils/pythonExecutor";

interface CodeEditorProps {
  challenge: Challenge;
  onCodeEvaluate: (code: string, results: PythonTestResult[]) => void;
  onChallengeSelect: (challenge: Challenge) => void;
  completedChallenges: Set<string>;
  isDarkMode: boolean;
  isSoundOn: boolean;
}

export default function CodeEditor({
  challenge,
  onCodeEvaluate,
  onChallengeSelect,
  completedChallenges,
  isDarkMode,
  isSoundOn,
}: CodeEditorProps) {
  const [code, setCode] = useState(challenge.starterCode || "");
  const [results, setResults] = useState<PythonTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const isMobile = useDeviceType();

  // Initialize Pyodide on component mount
  useEffect(() => {
    const initPyodide = async () => {
      try {
        await initializePyodide();
        setIsPyodideReady(true);
      } catch (error) {
        console.error('Failed to initialize Python environment:', error);
        setTerminalOutput(['Failed to initialize Python environment. Please refresh the page.']);
      }
    };
    initPyodide();
  }, []);

  const resetCode = () => {
    setCode(challenge.starterCode || "");
    setResults([]);
    setConsoleOutput([]);
    setTerminalOutput([]); // This will show the placeholder text again
  };

  const runCode = async () => {
    if (!isPyodideReady) {
      setTerminalOutput(['Python environment is still loading. Please wait...']);
      return;
    }

    setIsRunning(true);
    setTerminalOutput(['Running Python code...']);

    try {
      const output = await runPythonCode(code);
      setTerminalOutput(output);
    } catch (error) {
      setTerminalOutput([`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsRunning(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Add custom keybinding for formatting (Ctrl+Alt+F)
    editor.addAction({
      id: "format-code",
      label: "Format Code",
      keybindings: [
        monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      ],
      run: () => {
        editor.getAction("editor.action.formatDocument").run();
      },
    });

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 20,
      fontFamily:
        "'Fira Code', 'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
      fontLigatures: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: "on",
      lineNumbers: "on",
      glyphMargin: false,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      renderLineHighlight: "line",
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: "line",
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: "on",
      tabCompletion: "on",
      wordBasedSuggestions: "currentDocument",
      parameterHints: { enabled: true },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
      },
    });
  };
  const evaluateCode = async () => {
    if (!isPyodideReady) {
      setTerminalOutput(['Python environment is still loading. Please wait...']);
      return;
    }

    setIsEvaluating(true);
    setConsoleOutput([]);

    try {
      const { results: testResults, output } = await executePythonCode(code, challenge.testCases);
      
      setResults(testResults);
      setConsoleOutput(output);
      onCodeEvaluate(code, testResults);

      // Sound Effects
      const failedTest = testResults.length > 0 && testResults.every((r) => !r.passed);
      if (failedTest) {
        if (isSoundOn) {
          const sound = new Audio("/wrong-answer.mp3");
          sound.volume = 0.5;
          sound.play().catch((err) => {
            console.error("Failed to play sound:", err);
          });
        }

        window.scrollTo({
          top: isMobile ? document.body.scrollHeight : 300,
          behavior: "smooth",
        });
      }

      const partiallyCorrect =
        testResults.length > 0 &&
        testResults.some((r) => r.passed) &&
        !testResults.every((r) => r.passed);
      if (partiallyCorrect) {
        if (isSoundOn) {
          const sound = new Audio("/partially-correct.mp3");
          sound.volume = 1;
          sound.play().catch((err) => {
            console.error("Failed to play sound:", err);
          });
        }

        window.scrollTo({
          top: isMobile ? document.body.scrollHeight : 300,
          behavior: "smooth",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConsoleOutput([errorMessage]);
      
      // Mark all tests as failed
      const failedResults: PythonTestResult[] = challenge.testCases.map((testCase) => ({
        passed: false,
        input: testCase.input,
        expected: testCase.expected,
        actual: undefined,
        error: errorMessage,
        description: testCase.description,
      }));
      
      setResults(failedResults);
      onCodeEvaluate(code, failedResults);
    } finally {
      setIsEvaluating(false);
    }
  };

  const allTestsPassed = results.length > 0 && results.every((r) => r.passed);

  // Get next uncompleted challenge
  const nextChallenge = findNextUncompletedChallenge(
    challenge,
    completedChallenges
  );
  const hasNextChallenge = nextChallenge !== null;

  // Handlers for success modal
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleContinueToNext = () => {
    if (nextChallenge) {
      onChallengeSelect(nextChallenge);
    }
    setShowSuccessModal(false);
  };

  // Sound Effect and Success Modal
  useEffect(() => {
    if (allTestsPassed) {
      const sound = new Audio("/correct-answer.mp3");
      sound.play().catch((err) => {
        console.error("Failed to play sound:", err);
      });
      sound.volume = isSoundOn ? 0.5 : 0;

      // Show success modal
      setShowSuccessModal(true);
    }
  }, [allTestsPassed, isSoundOn]);

  return (
    <div className="flex flex-col h-full space-y-4 lg:space-y-4">
      {/* Code Editor */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
          <h3
            className={`font-medium ${
              isDarkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Code Editor{" "}
            {isMobile && (
              <span className="text-xs text-blue-500">(Mobile)</span>
            )}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={resetCode}
              data-tooltip-id="reset-code-tooltip"
              data-tooltip-content="Reset code to starter template"
              className={`flex items-center space-x-1 px-3 lg:px-3 py-1.5 rounded-md text-sm transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={runCode}
              disabled={isRunning}
              data-tooltip-id="run-code-tooltip"
              data-tooltip-content="Test your code and see output in terminal"
              className={`flex items-center space-x-1 px-3 lg:px-4 py-1.5 rounded-md text-sm transition-colors disabled:opacity-50 ${
                isDarkMode
                  ? "bg-green-700 hover:bg-green-600 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>{isRunning ? "Running..." : "Run"}</span>
            </button>
            <button
              onClick={evaluateCode}
              disabled={isEvaluating}
              data-tooltip-id="evaluate-code-tooltip"
              data-tooltip-content="Run all test cases and check your solution"
              className="flex items-center space-x-1 px-3 lg:px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{isEvaluating ? "Evaluating..." : "Evaluate"}</span>
            </button>
          </div>
        </div>

        <div
          className={`relative rounded-lg overflow-hidden border ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {isMobile ? (
            <CodeMirror
              value={code}
              height="300px"
              theme={isDarkMode ? oneDark : undefined}
              extensions={[python()]}
              onChange={(value) => setCode(value)}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                dropCursor: false,
                allowMultipleSelections: false,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightSelectionMatches: false,
              }}
            />
          ) : (
            <Editor
              height="350px"
              defaultLanguage="python"
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              theme={isDarkMode ? "vs-dark" : "light"}
              options={{
                fontSize: 14,
                lineHeight: 20,
                fontFamily:
                  "'Fira Code', 'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                wordWrap: "on",
                lineNumbers: "on",
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                renderLineHighlight: "line",
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: "line",
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "on",
                tabCompletion: "on",
                wordBasedSuggestions: "currentDocument",
                parameterHints: { enabled: true },
                quickSuggestions: {
                  other: true,
                  comments: true,
                  strings: true,
                },
                padding: {
                  top: 10,
                  bottom: 10,
                },
              }}
            />
          )}
        </div>

        <div
          className={`mt-2 text-xs ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {!isMobile && (
            <>
              <span>💡 Press </span>
              <kbd
                className={`px-1 py-0.5 rounded text-xs font-mono ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                Shift+Alt+F
              </kbd>
              <span> or </span>
              <kbd
                className={`px-1 py-0.5 rounded text-xs font-mono ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                Shift+Option+F
              </kbd>
              <span> to format your code</span>
            </>
          )}
        </div>
      </div>

      {/* Terminal Output - Always visible */}
      <div className="space-y-2">
        <h3
          className={`font-medium flex items-center space-x-2 ${
            isDarkMode ? "text-gray-200" : "text-gray-700"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Terminal</span>
        </h3>
        <div
          className={`p-3 rounded-lg font-mono text-sm border-l-4 ${
            isDarkMode
              ? "bg-gray-800 border-green-500"
              : "bg-gray-900 border-green-500"
          }`}
        >
          {terminalOutput.length > 0 ? (
            terminalOutput.map((log, index) => (
              <div key={index} className="flex text-green-400">
                <span className="text-green-500 mr-2">$</span>
                <span className="whitespace-pre-wrap">{log}</span>
              </div>
            ))
          ) : (
            <div className="flex text-green-400 opacity-60">
              <span className="text-green-500 mr-2">$</span>
              <span>
                Use print() to test your code before evaluating.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Test Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3
              className={`font-medium ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Test Results
            </h3>
            {allTestsPassed && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">All tests passed!</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.passed
                    ? isDarkMode
                      ? "bg-green-900/20 border-green-700 text-green-200"
                      : "bg-green-50 border-green-200 text-green-800"
                    : isDarkMode
                    ? "bg-red-900/20 border-red-700 text-red-200"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {result.description || `Test ${index + 1}`}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      result.passed
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {result.passed ? "PASS" : "FAIL"}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <div>
                    Input: <code className="font-mono">{result.input}</code>
                  </div>
                  <div>
                    Expected:{" "}
                    <code className="font-mono">
                      {JSON.stringify(result.expected)}
                    </code>
                  </div>
                  {result.error ? (
                    <div>
                      Error:{" "}
                      <code className="font-mono text-red-600">
                        {result.error}
                      </code>
                    </div>
                  ) : (
                    <div>
                      Actual:{" "}
                      <code className="font-mono">
                        {JSON.stringify(result.actual)}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Console Output */}
      {consoleOutput.length > 0 && (
        <div className="space-y-2">
          <h3
            className={`font-medium ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Console Output (Test Results)
          </h3>
          <div
            className={`p-3 rounded-lg font-mono text-sm ${
              isDarkMode
                ? "bg-gray-800 text-gray-300"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            {consoleOutput.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      )}

      <ChallengeSuccessModal
        isOpen={showSuccessModal}
        challenge={challenge}
        onClose={handleCloseSuccessModal}
        onContinue={handleContinueToNext}
        isDarkMode={isDarkMode}
        hasNextChallenge={hasNextChallenge}
      />

      {/* Tooltips */}
      <Tooltip
        id="reset-code-tooltip"
        place="bottom"
        style={{
          backgroundColor: isDarkMode ? "#374151" : "#111827",
          color: isDarkMode ? "#f3f4f6" : "#ffffff",
          fontSize: "12px",
          borderRadius: "6px",
          padding: "4px 8px",
          marginTop: 0
        }}
      />
      <Tooltip
        id="run-code-tooltip"
        place="bottom"
        style={{
          backgroundColor: isDarkMode ? "#374151" : "#111827",
          color: isDarkMode ? "#f3f4f6" : "#ffffff",
          fontSize: "12px",
          borderRadius: "6px",
          padding: "4px 8px",
          marginTop: 0
        }}
      />
      <Tooltip
        id="evaluate-code-tooltip"
         place="bottom-start"
        style={{
          backgroundColor: isDarkMode ? "#374151" : "#111827",
          color: isDarkMode ? "#f3f4f6" : "#ffffff",
          fontSize: "12px",
          borderRadius: "6px",
          padding: "4px 8px",
          marginTop: 0
        }}
      />
    </div>
  );
}
