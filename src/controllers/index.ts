import axios from "axios";

export const postPaintingInfo = async (req: any, res: any, next: any) => {
  try {
    const { question } = req.body;
    const result = await axios.post("http://127.0.0.1:5000/hello", { question });
    const contents = result.data;
    res.status(200).json({ message: "제대로 받아왔습니다.", contents });
  } catch (e) {
    console.error("에러가 발생", e);
    next();
  }
};
