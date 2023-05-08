import { Painting } from "~/models";
import { runGPT35 } from "~/api/openai";

export const getPaintingInfo = async (req: any, res: any, next: any) => {
  try {
    const { name, author } = req.body;
    const result = await Painting.findOne({
      where: { name, author },
      attributes: ["name", "author", "year", "description"],
    });
    if (!result) return res.status(404).json({ message: "존재하지 않는 그림입니다." });

    // answer following question given <relevant texts>, <query>
    const prompt = `아래 정보를 참고해서 답변을 생성해줘 : ${result.name} ${result.author} ${result.year} ${result.description}`;

    const answer = await runGPT35(prompt);
    res.status(200).json({ message: "GPT 답변은 다음과 같습니다.", answer });
  } catch {
    console.error("그림 정보를 가져오는데 오류가 발생");
  }
};
