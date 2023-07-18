const fs = require("fs");
const path = require("path");

function removeHeadersFromMarkdownFiles(sourceDir: string, destinationDir: string) {
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir);
  }
  // 주어진 디렉토리 내의 모든 파일과 폴더 목록 가져오기
  const files = fs.readdirSync(sourceDir);

  // 모든 파일과 폴더에 대해 작업 수행
  files.forEach((file: any) => {
    const sourceFilePath = path.join(sourceDir, file);
    const destinationFilePath = path.join(destinationDir, file);

    // 파일인 경우
    if (fs.lstatSync(sourceFilePath).isFile()) {
      // .md 파일인지 확인
      if (path.extname(file) === ".md") {
        // 파일 읽기
        const content = fs.readFileSync(sourceFilePath, "utf-8");

        // '##' 제거
        const modifiedContent = content.replace(/##/g, "");

        // 새로운 파일 저장
        fs.writeFileSync(destinationFilePath, modifiedContent, "utf-8");
      }
    }
    // 디렉토리인 경우
    else if (fs.lstatSync(sourceFilePath).isDirectory()) {
      // 재귀적으로 하위 폴더와 파일 처리
      removeHeadersFromMarkdownFiles(sourceFilePath, destinationFilePath);
    }
  });
}

const sourceDir = `${__dirname}/../../datas/markdown`;
const destinationDir = `${__dirname}/../../datas/markdown_`;
removeHeadersFromMarkdownFiles(sourceDir, destinationDir);
