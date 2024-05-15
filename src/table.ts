import * as vscode from "vscode";

interface IGlref {
  ref: string;
  def: string;
}

export function formatTables(document: vscode.TextDocument): vscode.TextEdit[] {
  let edits = <vscode.TextEdit[]>[];

  edits = edits.concat(formatGlos(document));
  edits = edits.concat(formatCtable(document));

  return edits;
}

function formatGlos(document: vscode.TextDocument): vscode.TextEdit[] {
  let edits = <vscode.TextEdit[]>[];

  if (!document.getText().includes("\\glos")) {
    return edits;
  }

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);

    let glref = <IGlref[]>[];
    const pattern = /\\glos\s+\{(.*?)(?<!\\)\}\s+\{(.*)(?<!\\)\}/;

    if (line.text.includes("\\glos")) {
      let j = 0;
      let maxlen = 0;

      while (true) {
        let lineGlos = document.lineAt(i + j);
        const res = pattern.exec(lineGlos.text);

        if (!res) {
          break;
        }

        glref.push({ ref: res[1], def: res[2] });
        res[1].length > maxlen ? (maxlen = res[1].length) : null;
        j++;
      }

      glref = glref.sort((a, b) =>
        a.ref.toLowerCase() < b.ref.toLowerCase() ? -1 : 1
      );

      for (let k = 0; k < j; k++) {
        const str =
          "\\glos {" +
          glref[k].ref +
          "} " +
          " ".repeat(maxlen - glref[k].ref.length) +
          "{" +
          glref[k].def +
          "}";

        edits.push(vscode.TextEdit.replace(document.lineAt(i + k).range, str));
      }

      i += glref.length - 1;
    }
  }
  return edits;
}

function formatCtable(document: vscode.TextDocument): vscode.TextEdit[] {
  let edits = <vscode.TextEdit[]>[];

  if (!document.getText().includes("\\ctable")) {
    return edits;
  }

  const patternTable = /\\ctable {([lcr]+)}/;

  for (let i = 0; i < document.lineCount; i++) {
    let line = document.lineAt(i);

    let res = patternTable.exec(line.text);
    if (!res) {
      continue;
    }

    let len = res[1].length;

    let lens = new Array(len).fill(0);

    let j = 1;
    const pattern = /(.*?)( & | \\cr)/g;

    while (
      !(
        document.lineAt(i + j).text.trim() == "}" ||
        document.lineAt(i + j).text.includes("\\caption") ||
        document.lineAt(i + j).text.includes("\\endinsert")
      )
    ) {
      const txt = document.lineAt(i + j).text;

      const res = [...txt.matchAll(pattern)];

      if (!res) {
        continue;
      }

      for (let k = 0; k < len; k++) {
        const cell = res[k][1];

        lens[k] < cell.length ? (lens[k] = cell.length) : null;
      }

      j++;
    }

    for (let k = 1; k < j; k++) {
      const txt = document.lineAt(i + k).text;

      const res = [...txt.matchAll(pattern)];

      if (!res) {
        continue;
      }

      let restxt = "";

      for (let l = 0; l < len - 1; l++) {
        const cell = res[l][1];

        restxt += cell;
        restxt += " ".repeat(lens[l] - cell.length) + " & ";
      }

      const cell = res[len - 1][1];

      restxt += cell;
      const rest = / \\cr.*/.exec(txt);
      restxt += " ".repeat(lens[len - 1] - cell.length);
      restxt += rest ? rest[0] : "";

      edits.push(vscode.TextEdit.replace(document.lineAt(i + k).range, restxt));
    }
  }

  return edits;
}
