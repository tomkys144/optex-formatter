import * as vscode from "vscode";

export function indent(
  indent_symbol: string,
  document: vscode.TextDocument
): vscode.TextEdit[] {
  let indent = 0;
  let sec = false;
  let secc = false;
  let math = false;
  let bracket = 0;

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
    } else if (txt != "}" && txt != "$$") {
      edit.push(setIndent(line, indent, indent_symbol));
    }

    if (txt == "$$") {
      if (math) {
        indent -= 1;
      }

      edit.push(setIndent(line, indent, indent_symbol));

      if (math) {
        math = false;
      } else {
        indent += 1;
        math = true;
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
}

function setIndent(
  line: vscode.TextLine,
  indent: number,
  symbol: string
): vscode.TextEdit {
  const txt = line.text.trim();
  const replacement = symbol.repeat(indent) + txt;
  return vscode.TextEdit.replace(line.range, replacement);
}
