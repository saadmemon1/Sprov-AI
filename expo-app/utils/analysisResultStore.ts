// analysisResultStore.ts
// Simple in-memory store for the last analysis result

let lastAnalysisResult: any = null;
let lastFileName: string | null = null;

export function setLastAnalysisResult(result: any, fileName: string) {
  lastAnalysisResult = result;
  lastFileName = fileName;
}

export function getLastAnalysisResult() {
  return { result: lastAnalysisResult, fileName: lastFileName };
}
