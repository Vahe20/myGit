import fs from "node:fs";
import path from "node:path";

export const initRepository = () => {
  const gitPath = path.join(process.cwd(), '.mygit');

  if (fs.existsSync(gitPath)) {
    console.log('Repository already exists');
    return;
  }

  fs.mkdirSync(gitPath);

  fs.mkdirSync(path.join(gitPath, "objects"));

  fs.mkdirSync(path.join(gitPath, "refs"));

  fs.writeFileSync(path.join(gitPath, "HEAD"), "ref: refs/heads/main\n");

  fs.writeFileSync(path.join(gitPath, "config"), `[core]repositoryformatversion = 0`);


  console.log(
    "Initialized empty MyGit repository"
  );
}