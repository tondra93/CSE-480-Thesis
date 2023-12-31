import connectDb from "../../../lib/db";
import User from "../../../lib/models/user";
// import mapUserToFolder from "../../../lib/utils/mapUserToFolder";
import { getStorage, ref, listAll } from "firebase/storage";
import { storage } from "../../../lib/src/firebase";
import userAnnotationModel from "../../../lib/models/user-annotation";

const mapUserToFolder = async (user) => {
  const listRef = ref(storage);
  const userAnnodation = await userAnnotationModel.find({});

  const folderNamesPromise = new Promise((resolve, reject) => {
    const folderNames = [];
    listAll(listRef)
      .then((res) => {
        res.prefixes.forEach((folderRef) => {
          if (
            !userAnnodation
              .map((e) => e.annotationFolder)
              .includes(folderRef.name)
          ) {
            folderNames.push(folderRef.name);
          }
        });
      })
      .then((final) => {
        resolve(folderNames);
      })
      .catch((err) => {
        reject("Error");
      });
  });
  const folderNames = await folderNamesPromise;
  console.log(userAnnodation.map((e) => e.user.toString()));
  console.log("user", user._id);
  console.log(
    "users",
    userAnnodation.map((e) => e.user.toString()).includes(user._id.toString())
  );
  if (
    userAnnodation
      .map((e) => e.user.toString())
      .includes(user._id.toString()) == false
  ) {
    const annotationFolder =
      folderNames[Math.floor(Math.random() * folderNames?.length)];
    const newUserAnnotation = await userAnnotationModel.create({
      user: user._id,
      annotationFolder,
    });
    console.log(newUserAnnotation);
  }
};

export default async function handler(req, res) {
  const { values } = req.body;
  await connectDb();

  try {
    const newAnnotator = new User({
      email: values.email,
      name: values.name,
      password: values.password,
      role: values.role,
    });

    const annotator = await newAnnotator.save();
    mapUserToFolder(annotator);
    res.json({ annotator });
  } catch (err) {
    console.log({ err });
    res.json({ err });
  }
}
