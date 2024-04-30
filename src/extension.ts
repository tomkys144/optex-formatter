// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

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

      let indent = 0;
      let sec = false;
      let secc = false;
      let math = false;
      let bracket = 0;
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

      let edit: vscode.TextEdit[] = [];
      for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        if (line.isEmptyOrWhitespace) {
          continue;
        }

        let txt = line.text.trim();

        const command = /\\[a-zA-Z]*/.exec(txt);

        if (command) {
          switch (command[0]) {
            case "\\app":
            case "\\bibchap":
            case "\\chap":
              indent = 0;
              edit.push(setIndent(line, indent, indent_symbol));
              sec = false;
              secc = false;
              indent = 1;
              break;

            case "\\sec":
              if (sec) {
                indent -= 1;
              }
              if (secc) {
                indent -= 1;
              }
              edit.push(setIndent(line, indent, indent_symbol));
              indent += 1;
              sec = true;
              secc = false;
              break;

            case "\\secc":
              if (secc) {
                indent -= 1;
              }
              edit.push(setIndent(line, indent, indent_symbol));
              indent += 1;
              secc = true;
              break;

            case "\\midinsert":
              edit.push(setIndent(line, indent, indent_symbol));
              indent += 1;
              break;

            case "\\endinsert":
              indent -= 1;
              edit.push(setIndent(line, indent, indent_symbol));
              break;

            default:
              edit.push(setIndent(line, indent, indent_symbol));
          }
        } else if (txt != "}") {
          edit.push(setIndent(line, indent, indent_symbol));
        }

        if (txt == "$$") {
          if (math) {
            indent -= 1;
          }

          edit.push(setIndent(line, indent, indent_symbol));

          if (!math) {
            indent += 1;
            math = true;
          } else {
            math = false;
          }
        }

        if (txt.includes("{")) {
          let num = txt.replace(/[^{]/g, "").length;

          bracket += num;
          indent += num;
        }

        if (txt.includes("}")) {
          let num = txt.replace(/[^}]/g, "").length;

          bracket -= num;
          indent -= num;

          if (indent < 0) {
            indent = 0;
          }

          if (bracket < 0) {
            indent = 0;
          }

          if (txt == "}") {
            edit.push(setIndent(line, indent, indent_symbol));
          }
        }
      }

      console.log("Finsihed");

      return edit;
    },
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}

function setIndent(
  line: vscode.TextLine,
  indent: number,
  symbol: string
): vscode.TextEdit {
  const txt = line.text.trimStart();
  const replacement = symbol.repeat(indent) + txt;
  return vscode.TextEdit.replace(line.range, replacement);
}
