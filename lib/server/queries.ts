import Dataset from "../models/dataset";
import Stats from "../models/stats";
import User from "../models/user";

export async function FIND_ONE_PHOTO(id: String) {
  return await Dataset.findOne({ lock: false}).lean();
}

export async function FIND_ONE_INVALIDATE_SENTENCE() {
  return await Dataset.findOne({
    isLockToValidate: false,
    isValidated: false,
    isAnnotated: true,
  }).lean();
}

export async function FIND_ANNOTATORS() {
  return await User.find({ role: "annotator" });
}

export async function LOCK_PHOTO_TO_USER(senId: String, userId: String) {
  return await Dataset.updateOne(
    { _id: senId },
    { $set: { lock: true, user_id: userId } }
  );
}

export async function LOCK_INVALIDATE_SENTENCE_TO_USER(
  senId: String,
  userId: String
) {
  return await Dataset.updateOne(
    { _id: senId },
    { $set: { isLockToValidate: true, validate_user_id: userId } }
  );
}

export async function FIND_LOCKED_PHOTO_TO_USER(userId: String) {
  return await Dataset.findOne({
    lock: true,
    user_id: userId,
    isAnnotated: false,
  });
}

export async function FIND_LOCKED_INVALIDATE_SENTENCE_TO_USER(userId: String) {
  return await Dataset.findOne({
    isLockToValidate: true,
    validate_user_id: userId,
    isValidated: false,
  });
}

export async function GET_ANNOTATED_DATA_AND_USER_INFO() {
  return await Dataset.aggregate([
    { $match: { lock: true, isAnnotated: true } },
    {
      $lookup: {
        from: "users",
        let: {
          userid: "$user_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  {
                    $toString: "$_id",
                  },
                  "$$userid",
                ],
              },
            },
          },
        ],
        as: "user",
      },
    },
  ]);
}

export async function GET_STATS_TABLE_INFO() {
  return await Stats.aggregate([
    {
      $lookup: {
        from: "users",
        let: {
          userid: "$user_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  {
                    $toString: "$_id",
                  },
                  "$$userid",
                ],
              },
            },
          },
        ],
        as: "user",
      },
    },
  ]);
}

export async function GET_ALL_USER_ANNOTATION_STATS() {
  return await Stats.aggregate([
    {
      $lookup: {
        from: "users",
        let: {
          userid: "$user_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  {
                    $toString: "$_id",
                  },
                  "$$userid",
                ],
              },
            },
          },
        ],
        as: "user",
      },
    },
  ]);
}
