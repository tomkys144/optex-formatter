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
      let indent = 0;
      let sec = false;
      let secc = false;
      let math = false;
      let cmd = false;

      let indent_symbol = " ".repeat(4);
      let edit: vscode.TextEdit[] = [];
      for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        if (line.isEmptyOrWhitespace) {
          continue;
        }
        const command = /\\[a-zA-Z]*/.exec(line.text);

        if (cmd && line.text.trim() == "}") {
          indent -= 1;
          cmd = false;
          edit.push(
            vscode.TextEdit.replace(
              line.range,
              indent_symbol.repeat(indent) + line.text.trimStart()
            )
          );
        }

        if (!command) {
          edit.push(
            vscode.TextEdit.replace(
              line.range,
              indent_symbol.repeat(indent) + line.text.trimStart()
            )
          );
          continue;
        }

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

          case "$$":
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
            break;

          case "\\midinsert":
            edit.push(setIndent(line, indent, indent_symbol));
            indent += 1;
            break;

          case "\\endinsert":
            indent -= 1;
            edit.push(setIndent(line, indent, indent_symbol));
            break;

          case "\\specification":
          case "\\abstractCZ":
          case "\\abstractEN":
          case "\\thanks":
          case "\\declaration":
          case "\\ctable":
            edit.push(setIndent(line, indent, indent_symbol));
            indent += 1;
            cmd = true;
            break;

          case "\\caption":
            if (cmd) {
              indent -= 1;
            }

            edit.push(setIndent(line, indent, indent_symbol));
            break;

          default:
            edit.push(setIndent(line, indent, indent_symbol));
            break;
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
