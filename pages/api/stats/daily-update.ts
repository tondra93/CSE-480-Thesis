import { NextApiRequest, NextApiResponse } from "next";
import connectDb from "../../../lib/db";
import Stats from "../../../lib/models/stats";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDb();

  try {
    const get_stats = await Stats.find({});

    console.log({ get_stats });
    const update_stats = get_stats.map((e) => {
      return {
        id: e._id,
        words: e.current_words - e.last_words_daily,
        sentences: e.current_sentence - e.last_sentence_daily,
        updated_words: e.current_words,
        update_sentences: e.current_sentence,
      };
    });

    console.log({ update_stats });

    update_stats.map(
      async (e) =>
        await Stats.updateOne(
          { _id: e.id },
          {
            $set: {
              daily_words: e.words,
              daily_sentence: e.sentences,
              last_words_daily: e.updated_words,
              last_sentence_daily: e.update_sentences,
            },
          }
        )
    );
    res.json({ message: "successful" });
  } catch (err) {
    console.log({ err });
  }
}
