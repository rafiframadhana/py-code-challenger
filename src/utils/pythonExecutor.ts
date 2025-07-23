// Python execution utility with comprehensive test case handling
declare global {
  interface Window {
    loadPyodide: any;
    pyodide: any;
  }
}

interface PyProxy {
  toJs(): unknown;
  constructor: { name: string };
}

let pyodideInstance: any = null;

export async function initializePyodide(): Promise<void> {
  if (pyodideInstance) return;
  
  try {
    if (window.loadPyodide) {
      pyodideInstance = await window.loadPyodide();
      console.log('Pyodide initialized successfully');
    } else {
      throw new Error('Pyodide is not available. Please check your internet connection.');
    }
  } catch (error) {
    console.error('Failed to initialize Pyodide:', error);
    throw error;
  }
}

export interface PythonTestResult {
  passed: boolean;
  input: string;
  expected: unknown;
  actual: unknown;
  error?: string;
  description?: string;
}

export async function executePythonCode(
  code: string,
  testCases: Array<{
    input: string;
    expected: unknown;
    description?: string;
  }>
): Promise<{
  results: PythonTestResult[];
  output: string[];
}> {
  if (!pyodideInstance) {
    await initializePyodide();
  }

  const results: PythonTestResult[] = [];
  const output: string[] = [];

  try {
    // Execute user code
    console.log('Executing user code:', code);
    pyodideInstance.runPython(code);

    // Extract function name from code
    const functionMatch = code.match(/def\s+(\w+)\s*\(/);
    if (!functionMatch) {
      throw new Error('No function definition found. Please define a function using "def function_name():');
    }
    
    const functionName = functionMatch[1];
    console.log('Found function:', functionName);

    // Test each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\\n=== Testing case ${i + 1}: ${testCase.input} ===`);
      
      try {
        // Handle different input types properly
        let pythonCall: string;
        
        // Check if this is a dictionary input (starts with { and ends with })
        if (testCase.input.trim().startsWith('{') && testCase.input.trim().endsWith('}')) {
          // For dictionary inputs, we need to handle them specially
          let testResult: unknown = undefined;
          let actualResult: unknown = undefined;
          
          // Convert JavaScript boolean values to Python boolean values
          const pythonInput = testCase.input
            .replace(/:\s*true/g, ': True')
            .replace(/:\s*false/g, ': False')
            .replace(/:\s*null/g, ': None');
          
          // First try direct execution - the dictionary syntax should work directly
          try {
            pythonCall = `${functionName}(${pythonInput})`;
            console.log(`Executing Python call for dictionary: ${pythonCall}`);
            testResult = pyodideInstance.runPython(pythonCall);
            
            console.log('Dictionary test result:', testResult);
            
            // Convert Pyodide Proxy objects to JavaScript objects
            actualResult = testResult;
            if (testResult && typeof testResult === 'object' && testResult.constructor.name === 'PyProxy') {
              try {
                // Convert Python dictionary to JavaScript object
                actualResult = (testResult as PyProxy).toJs();
                console.log('Converted from PyProxy to JS:', actualResult);
              } catch (error) {
                console.log('Failed to convert PyProxy, using original:', error);
              }
            }
            
            // Check if result is undefined (common Pyodide issue)
            if (actualResult === undefined) {
              // Try alternative approach using globals
              pyodideInstance.runPython(`
test_dict = ${pythonInput}
test_result = ${functionName}(test_dict)
`);
              let alternativeResult = pyodideInstance.runPython('test_result');
              console.log('Alternative result:', alternativeResult);
              
              // Convert alternative result if it's a PyProxy
              if (alternativeResult && typeof alternativeResult === 'object' && alternativeResult.constructor.name === 'PyProxy') {
                try {
                  alternativeResult = (alternativeResult as PyProxy).toJs();
                  console.log('Converted alternative result from PyProxy to JS:', alternativeResult);
                } catch (error) {
                  console.log('Failed to convert alternative PyProxy:', error);
                }
              }
              
              if (alternativeResult !== undefined) {
                const passed = JSON.stringify(alternativeResult) === JSON.stringify(testCase.expected);
                console.log(`Comparison: ${JSON.stringify(alternativeResult)} === ${JSON.stringify(testCase.expected)} -> ${passed}`);
                
                results.push({
                  passed,
                  input: testCase.input,
                  expected: testCase.expected,
                  actual: alternativeResult,
                  description: testCase.description,
                });
                continue;
              } else {
                // Still undefined, keep testResult as undefined for error handling
                testResult = undefined;
                actualResult = undefined;
              }
            }
            
          } catch (error) {
            console.error('Dictionary test error:', error);
            results.push({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: undefined,
              error: error instanceof Error ? error.message : 'Unknown error',
              description: testCase.description,
            });
            continue;
          }
          
          // Standard processing 
          const isDictError = typeof actualResult === 'string' && (
            (actualResult as string).includes('Error') || 
            (actualResult as string).includes('Exception') ||
            (actualResult as string).includes('Traceback')
          );

          if (isDictError) {
            console.log('Test failed with error:', actualResult);
            results.push({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: undefined,
              error: actualResult as string,
              description: testCase.description,
            });
          } else if (actualResult === undefined) {
            // Handle undefined result
            console.log('Test result is undefined');
            results.push({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: undefined,
              error: 'Function execution returned undefined',
              description: testCase.description,
            });
          } else {
            // Compare results
            const passed = JSON.stringify(actualResult) === JSON.stringify(testCase.expected);
            console.log(`Comparison: ${JSON.stringify(actualResult)} === ${JSON.stringify(testCase.expected)} -> ${passed}`);
            
            results.push({
              passed,
              input: testCase.input,
              expected: testCase.expected,
              actual: actualResult,
              description: testCase.description,
            });
          }
          continue;
        }
        
        // For non-dictionary inputs, use the original approach
        // But first, convert JavaScript boolean/null values to Python equivalents
        const convertedInput = testCase.input
          .replace(/:\s*true/g, ': True')
          .replace(/:\s*false/g, ': False')
          .replace(/:\s*null/g, ': None')
          .replace(/,\s*true/g, ', True')
          .replace(/,\s*false/g, ', False')
          .replace(/,\s*null/g, ', None')
          .replace(/\bnull\b/g, 'None');
        
        // Special handling for TreeNode constructor calls
        if (convertedInput.includes('TreeNode(')) {
          // For tree node inputs, we need to create the tree structure first
          try {
            // First, ensure TreeNode class is defined (in case user didn't include it)
            pyodideInstance.runPython(`
# Ensure TreeNode class is available
if 'TreeNode' not in globals():
    class TreeNode:
        def __init__(self, val=0, left=None, right=None):
            self.val = val
            self.left = left
            self.right = right
            
        def __str__(self):
            return f"TreeNode({self.val})"
            
        def __repr__(self):
            return f"TreeNode({self.val})"
`);
            
            // Parse multiple TreeNode arguments using proper parentheses counting
            function parseTreeNodeArguments(input: string): string[] {
              const treeNodes: string[] = [];
              let currentArg = '';
              let parenCount = 0;
              let inTreeNode = false;
              let i = 0;
              
              while (i < input.length) {
                const char = input[i];
                
                // Check if we're starting a TreeNode
                if (input.substring(i, i + 8) === 'TreeNode' && !inTreeNode) {
                  if (currentArg.trim()) {
                    // We were building a previous TreeNode, save it
                    treeNodes.push(currentArg.trim());
                  }
                  currentArg = 'TreeNode';
                  inTreeNode = true;
                  i += 8;
                  continue;
                }
                
                if (inTreeNode) {
                  currentArg += char;
                  
                  if (char === '(') {
                    parenCount++;
                  } else if (char === ')') {
                    parenCount--;
                    
                    // If we've closed all parentheses for this TreeNode
                    if (parenCount === 0) {
                      treeNodes.push(currentArg.trim());
                      currentArg = '';
                      inTreeNode = false;
                    }
                  }
                }
                
                i++;
              }
              
              // Handle any remaining TreeNode
              if (currentArg.trim() && inTreeNode) {
                treeNodes.push(currentArg.trim());
              }
              
              return treeNodes;
            }
            
            const treeNodes = parseTreeNodeArguments(convertedInput);
            console.log('Found TreeNode arguments:', treeNodes);
            
            if (treeNodes.length === 1) {
              // Single TreeNode argument
              pyodideInstance.runPython(`test_input = ${convertedInput}`);
              
              // Then call the function based on the expected output format
              const expectedOutput = testCase.expected;
              let functionCalls: string;
              
              if (typeof expectedOutput === 'object' && expectedOutput !== null && !Array.isArray(expectedOutput)) {
                // Multiple functions (like inorder, preorder, postorder for tree traversal)
                const expectedKeys = Object.keys(expectedOutput);
                if (expectedKeys.length > 1) {
                  const calls = expectedKeys.map(key => `"${key}": ${key}_traversal(test_input)`).join(', ');
                  functionCalls = `{${calls}}`;
                } else {
                  // Single function that returns an object
                  functionCalls = `${functionName}(test_input)`;
                }
              } else {
                // Single function that returns a primitive value (boolean, number, etc.)
                functionCalls = `${functionName}(test_input)`;
              }
              
              console.log(`Executing single tree function call: ${functionCalls}`);
              const testResult = pyodideInstance.runPython(functionCalls);
              
              console.log('Single tree test result:', testResult);
              
              // Convert Pyodide Proxy objects to JavaScript objects
              let actualResult = testResult;
              if (testResult && typeof testResult === 'object' && testResult.constructor.name === 'PyProxy') {
                try {
                  actualResult = (testResult as PyProxy).toJs();
                  console.log('Converted single tree result from PyProxy to JS:', actualResult);
                } catch (error) {
                  console.log('Failed to convert single tree PyProxy, using original:', error);
                }
              }
              
              // Compare results
              const passed = JSON.stringify(actualResult) === JSON.stringify(testCase.expected);
              console.log(`Single tree comparison: ${JSON.stringify(actualResult)} === ${JSON.stringify(testCase.expected)} -> ${passed}`);
              
              results.push({
                passed,
                input: testCase.input,
                expected: testCase.expected,
                actual: actualResult,
                description: testCase.description,
              });
              continue;
              
            } else {
              // Multiple TreeNode arguments - create variables for each
              for (let i = 0; i < treeNodes.length; i++) {
                pyodideInstance.runPython(`tree_arg_${i} = ${treeNodes[i]}`);
              }
              
              // Special handling for LCA problems - need to find actual nodes in the tree by value
              if (treeNodes.length === 3 && functionName === 'lowest_common_ancestor') {
                // For LCA, we have root, p, q where p and q are typically single-value TreeNodes
                // We need to find the actual nodes in the tree that have those values
                
                // Extract values from p and q TreeNodes
                const pMatch = treeNodes[1].match(/TreeNode\((\d+)\)/);
                const qMatch = treeNodes[2].match(/TreeNode\((\d+)\)/);
                
                if (pMatch && qMatch) {
                  const pValue = pMatch[1];
                  const qValue = qMatch[1];
                  
                  console.log(`Looking for nodes with values ${pValue} and ${qValue} in the tree`);
                  
                  // Create a helper function to find nodes by value
                  pyodideInstance.runPython(`
def find_node_by_value(root, target_val):
    if not root:
        return None
    if root.val == target_val:
        return root
    left = find_node_by_value(root.left, target_val)
    if left:
        return left
    return find_node_by_value(root.right, target_val)

# Find the actual nodes in the tree
p_node = find_node_by_value(tree_arg_0, ${pValue})
q_node = find_node_by_value(tree_arg_0, ${qValue})
`);
                  
                  const functionCall = `${functionName}(tree_arg_0, p_node, q_node)`;
                  
                  console.log(`Executing LCA function call: ${functionCall}`);
                  const testResult = pyodideInstance.runPython(functionCall);
                  
                  console.log('LCA test result:', testResult);
                  
                  // Convert Pyodide Proxy objects to JavaScript objects
                  let actualResult = testResult;
                  if (testResult && typeof testResult === 'object' && testResult.constructor.name === 'PyProxy') {
                    try {
                      actualResult = (testResult as PyProxy).toJs();
                      console.log('Converted LCA result from PyProxy to JS:', actualResult);
                    } catch (error) {
                      console.log('Failed to convert LCA PyProxy, using original:', error);
                    }
                  }
                  
                  // For TreeNode return values, convert to string representation
                  if (actualResult && typeof actualResult === 'object' && actualResult.constructor && actualResult.constructor.name === 'PyProxy') {
                    // Try to get string representation of the TreeNode
                    try {
                      const nodeStr = pyodideInstance.runPython(`str(${functionCall})`);
                      actualResult = nodeStr;
                      console.log('Converted LCA TreeNode result to string:', actualResult);
                    } catch (error) {
                      console.log('Failed to get LCA string representation:', error);
                    }
                  }
                  
                  // Compare results (TreeNode results are typically strings)
                  const passed = JSON.stringify(actualResult) === JSON.stringify(testCase.expected);
                  console.log(`LCA comparison: ${JSON.stringify(actualResult)} === ${JSON.stringify(testCase.expected)} -> ${passed}`);
                  
                  results.push({
                    passed,
                    input: testCase.input,
                    expected: testCase.expected,
                    actual: actualResult,
                    description: testCase.description,
                  });
                  continue;
                } else {
                  console.log('Could not extract values from TreeNode arguments for LCA');
                }
              }
              
              // Regular multi-tree handling for non-LCA functions
              // Build function call with multiple arguments
              const argsList = treeNodes.map((_, index) => `tree_arg_${index}`).join(', ');
              const functionCall = `${functionName}(${argsList})`;
              
              console.log(`Executing multi-tree function call: ${functionCall}`);
              const testResult = pyodideInstance.runPython(functionCall);
              
              console.log('Multi-tree test result:', testResult);
              
              // Convert Pyodide Proxy objects to JavaScript objects
              let actualResult = testResult;
              if (testResult && typeof testResult === 'object' && testResult.constructor.name === 'PyProxy') {
                try {
                  actualResult = (testResult as PyProxy).toJs();
                  console.log('Converted multi-tree result from PyProxy to JS:', actualResult);
                } catch (error) {
                  console.log('Failed to convert multi-tree PyProxy, using original:', error);
                }
              }
              
              // For TreeNode return values, convert to string representation
              if (actualResult && typeof actualResult === 'object' && actualResult.constructor && actualResult.constructor.name === 'PyProxy') {
                // Try to get string representation of the TreeNode
                try {
                  const nodeStr = pyodideInstance.runPython(`str(${functionCall})`);
                  actualResult = nodeStr;
                  console.log('Converted TreeNode result to string:', actualResult);
                } catch (error) {
                  console.log('Failed to get string representation:', error);
                }
              }
              
              // Compare results (TreeNode results are typically strings)
              const passed = JSON.stringify(actualResult) === JSON.stringify(testCase.expected);
              console.log(`Multi-tree comparison: ${JSON.stringify(actualResult)} === ${JSON.stringify(testCase.expected)} -> ${passed}`);
              
              results.push({
                passed,
                input: testCase.input,
                expected: testCase.expected,
                actual: actualResult,
                description: testCase.description,
              });
              continue;
            }
            
          } catch (error) {
            console.error('Tree test error:', error);
            results.push({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: undefined,
              error: error instanceof Error ? error.message : 'Unknown error',
              description: testCase.description,
            });
            continue;
          }
        }
        
        // Regular non-dictionary, non-TreeNode inputs
        if (convertedInput.includes(',') && !convertedInput.trim().startsWith('[')) {
          // Multiple arguments case like "[1, 2, 3], 5"
          pythonCall = `${functionName}(${convertedInput})`;
        } else {
          // Single argument case like "[1, 2, 3]"
          pythonCall = `${functionName}(${convertedInput})`;
        }
        
        console.log(`Executing Python call: ${pythonCall}`);
        const testResult = pyodideInstance.runPython(pythonCall);

        console.log('Test result:', testResult);
        
        // Convert Pyodide Proxy objects to JavaScript objects for non-dictionary inputs too
        let actualResult = testResult;
        if (testResult && typeof testResult === 'object' && testResult.constructor.name === 'PyProxy') {
          try {
            // Convert Python dictionary to JavaScript object
            actualResult = (testResult as PyProxy).toJs();
            console.log('Converted non-dict result from PyProxy to JS:', actualResult);
          } catch (error) {
            console.log('Failed to convert non-dict PyProxy, using original:', error);
          }
        }
        
        // Check if result is an error
        const isError = typeof actualResult === 'string' && (
          (actualResult as string).includes('Error') || 
          (actualResult as string).includes('Exception') ||
          (actualResult as string).includes('Traceback')
        );

        if (isError) {
          console.log('Test failed with error:', actualResult);
          results.push({
            passed: false,
            input: testCase.input,
            expected: testCase.expected,
            actual: undefined,
            error: actualResult as string,
            description: testCase.description,
          });
        } else {
          // Compare results
          const passed = JSON.stringify(actualResult) === JSON.stringify(testCase.expected);
          console.log(`Comparison: ${JSON.stringify(actualResult)} === ${JSON.stringify(testCase.expected)} -> ${passed}`);
          
          results.push({
            passed,
            input: testCase.input,
            expected: testCase.expected,
            actual: actualResult,
            description: testCase.description,
          });
        }
        
      } catch (error) {
        console.error(`Test case ${i + 1} error:`, error);
        results.push({
          passed: false,
          input: testCase.input,
          expected: testCase.expected,
          actual: undefined,
          error: error instanceof Error ? error.message : 'Unknown error',
          description: testCase.description,
        });
      }
    }

  } catch (error) {
    console.error('Global error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    output.push(errorMessage);
    
    testCases.forEach((testCase) => {
      results.push({
        passed: false,
        input: testCase.input,
        expected: testCase.expected,
        actual: undefined,
        error: errorMessage,
        description: testCase.description,
      });
    });
  }

  console.log('Final results:', results);
  return { results, output };
}

export async function runPythonCode(code: string): Promise<string[]> {
  if (!pyodideInstance) {
    await initializePyodide();
  }

  const output: string[] = [];

  try {
    // Capture print output
    pyodideInstance.runPython(`
import sys
from io import StringIO

old_stdout = sys.stdout
captured_output = StringIO()
sys.stdout = captured_output
    `);

    // Execute user code
    pyodideInstance.runPython(code);

    // Get captured output
    const capturedOutput = pyodideInstance.runPython('captured_output.getvalue()');
    
    // Restore stdout
    pyodideInstance.runPython('sys.stdout = old_stdout');
    
    if (capturedOutput) {
      output.push(...capturedOutput.split('\\n').filter((line: string) => line.trim()));
    }

    if (output.length === 0) {
      output.push('Code executed successfully. No output detected. Use print() to display output here.');
    }

  } catch (error) {
    try {
      pyodideInstance.runPython('sys.stdout = old_stdout');
    } catch {
      // Ignore error when restoring stdout
    }
    output.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return output;
}
