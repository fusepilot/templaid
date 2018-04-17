import * as fs from "fs-extra";
import { resolve, relative, basename, join, parse } from "path";

export interface IFile {
  kind: "file";
  name: string;
  path: string;
  size: number;
  content: string;
}

export interface IDirectory {
  kind: "directory";
  name: string;
  path: string;
  children: Array<IFile | IDirectory>;
}

export type Item = IFile | IDirectory;

const recurse = async ({
  path = __dirname,
  root
}: {
  path: string;
  root: string;
}): Promise<Item> => {
  path = resolve(path);

  const name = basename(path);
  let item = { path, name };

  const stat = await fs.stat(path);

  if (stat.isFile()) {
    const buffer = await fs.readFile(path);
    const content = buffer.toString();

    return {
      name,
      path: relative(root, path),
      kind: "file",
      size: stat.size,
      content
    };
  } else if (stat.isDirectory()) {
    let children = (await fs.readdir(path)) as string[];

    const items = await Promise.all(
      children.map(async child => {
        return await recurse({ path: join(path, child), root });
      })
    );

    return {
      name,
      path: relative(root, path),
      kind: "directory",
      children: items
    };
  } else {
    throw new Error(`error reading ${path}`);
  }
};

export const tree = async ({ path = __dirname }): Promise<Item> => {
  return await recurse({ path, root: path });
};
