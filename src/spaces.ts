import * as vscode from "vscode";

export function formatSpaces(document: vscode.TextDocument): vscode.TextEdit[] {
  let edits = <vscode.TextEdit[]>[];

  edits = edits.concat(removeMultispace(document));
  return edits;
}

function removeMultispace(document: vscode.TextDocument): vscode.TextEdit[] {
  let edits = <vscode.TextEdit[]>[];

  let pattern = /(?<=\S)\s{2,}/g

  for (let i = 0; i < document.lineCount; i++) {
    let line = document.lineAt(i);

    let txt = line.text;

    const spaces = pattern.exec(txt)

    if (!spaces) {
      continue
    }
    const replacement = txt.replaceAll(pattern, ' ')

    edits.push(vscode.TextEdit.replace(line.range, replacement))
  }

  return edits;
}
