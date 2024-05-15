// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { indent } from "./indent";
import { checkLines } from "./lines";
import { formatSpaces } from "./spaces";
import { formatTables } from "./table";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  vscode.languages.registerDocumentFormattingEditProvider("optex", {
    provideDocumentFormattingEdits(
      document: vscode.TextDocument
    ): vscode.TextEdit[] {
      if (document.languageId != "optex") {
        return <vscode.TextEdit[]>[];
      }

      const settings = vscode.workspace.getConfiguration("optex-formatter");
      var indent_symbol = "";

      if (settings.get("indentStyle") == "space") {
        let width = settings.get("indentWidth");
        if (typeof width == "number") {
          indent_symbol = " ".repeat(width);
        } else {
          indent_symbol = " ".repeat(4);
        }
      } else {
        indent_symbol = "\t";
      }
      let edits = <vscode.TextEdit[]>[];

      edits = edits.concat(indent(indent_symbol, document));

      edits = edits.concat(checkLines(document));

      edits = edits.concat(formatSpaces(document));

      edits = edits.concat(formatTables(document));

      return edits;
    },
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
