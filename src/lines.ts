import * as vscode from "vscode";

export function checkLines(document: vscode.TextDocument): vscode.TextEdit[] {
  let edits = <vscode.TextEdit[]>[];

  edits = edits.concat(emptyLines(document));
  edits = edits.concat(headers(document));

  return edits;
}

function emptyLines(document: vscode.TextDocument): vscode.TextEdit[] {
  let emptyline = false;
  let edits = <vscode.TextEdit[]>[];
  let line = document.lineAt(0);

  if (line.isEmptyOrWhitespace) {
    edits.push(vscode.TextEdit.delete(line.rangeIncludingLineBreak));
  }

  for (let i = 1; i < document.lineCount; i++) {
    let line = document.lineAt(i);

    if (!line.isEmptyOrWhitespace) {
      emptyline = false;
      continue;
    }

    if (emptyline) {
      edits.push(vscode.TextEdit.delete(line.rangeIncludingLineBreak));
    }

    emptyline = true;
  }

  return edits;
}

function headers(document: vscode.TextDocument): vscode.TextEdit[] {
  let edits = <vscode.TextEdit[]>[];

  let math = false;

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);

    if (line.isEmptyOrWhitespace) {
      continue;
    }

    const txt = line.text.trim();

    let command = /\\[a-zA-Z]*/.exec(txt);

    if (!command) {
      if (txt == "$$") {
        if (math) {
          let m = 1;
          while (i - m >= 0 && document.lineAt(i - m).isEmptyOrWhitespace) {
            if (
              !["\\endinsert", "$$"].some((v) =>
                document.lineAt(i - m - 1).text.includes(v)
              )
            ) {
              edits.push(
                vscode.TextEdit.delete(
                  document.lineAt(i - m).rangeIncludingLineBreak
                )
              );
            }
            m++;
          }

          if (!document.lineAt(i + 1).isEmptyOrWhitespace) {
            edits.push(
              vscode.TextEdit.insert(document.lineAt(i).range.end, getEOL())
            );
          }

          math = false;
        } else {
          if (i != 0 && !document.lineAt(i - 1).isEmptyOrWhitespace) {
            edits.push(
              vscode.TextEdit.insert(document.lineAt(i).range.start, getEOL())
            );
          }

          let n = 1;
          while (
            document.lineAt(i + n).isEmptyOrWhitespace &&
            i + n < document.lineCount - 1
          ) {
            if (
              i + n + 1 >= document.lineCount ||
              ![
                "\\chap",
                "\\sec",
                "\\secc",
                "\\midinsert",
                "\\bibchap",
                "\\app",
                "$$",
              ].some((v) => document.lineAt(i + n + 1).text.includes(v))
            ) {
              edits.push(
                vscode.TextEdit.delete(
                  document.lineAt(i + n).rangeIncludingLineBreak
                )
              );
            }
            n++;
          }
          math = true;
        }
      }

      continue;
    }

    switch (command[0]) {
      case "\\chap":
      case "\\sec":
      case "\\secc":
      case "\\midinsert":
      case "\\bibchap":
      case "\\app":
        if (i != 0 && !document.lineAt(i - 1).isEmptyOrWhitespace) {
          edits.push(
            vscode.TextEdit.insert(document.lineAt(i).range.start, getEOL())
          );
        }

        let n = 1;
        while (
          document.lineAt(i + n).isEmptyOrWhitespace &&
          i + n < document.lineCount - 1
        ) {
          if (
            i + n + 1 >= document.lineCount ||
            ![
              "\\chap",
              "\\sec",
              "\\secc",
              "\\midinsert",
              "\\bibchap",
              "\\app",
              "$$",
            ].some((v) => document.lineAt(i + n + 1).text.includes(v))
          ) {
            edits.push(
              vscode.TextEdit.delete(
                document.lineAt(i + n).rangeIncludingLineBreak
              )
            );
          }
          n++;
        }
        break;

      case "\\endinsert":
        let m = 1;
        while (i - m >= 0 && document.lineAt(i - m).isEmptyOrWhitespace) {
          if (
            !["\\endinsert", "$$"].some((v) =>
              document.lineAt(i - m - 1).text.includes(v)
            )
          ) {
            edits.push(
              vscode.TextEdit.delete(
                document.lineAt(i - m).rangeIncludingLineBreak
              )
            );
          }
          m++;
        }

        if (!document.lineAt(i + 1).isEmptyOrWhitespace) {
          edits.push(
            vscode.TextEdit.insert(document.lineAt(i).range.end, getEOL())
          );
        }
        break;
    }
  }

  return edits;
}

function getEOL(): string {
  const eol = vscode.EndOfLine;

  return eol.LF ? "\n" : "\r\n";
}
