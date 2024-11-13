import dotenv from "dotenv";
import UserModel from "../models/UserModel";
import bcrypt from "bcrypt";
import { getAccessToken } from "../utils/getAccessToken";

dotenv.config();
const register = async (req: any, res: any) => {
  const body = req.body;
  const { name, email, password } = body;

  try {
    // email phải là duu nhất
    const user = await UserModel.findOne({ email });
    if (user) {
      throw new Error(`Email ${email} đã tồn tại`);
    }
    // hassparword
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    body.password = hashPassword;
    const newUser: any = new UserModel(body);
    await newUser.save();
    // //  Xóa password
    delete newUser._doc.password;

    // Trả về phản hồi thành công với mã trạng thái 200
    res.status(200).json({
      message: "User created successfully, register",
      data: {
        ...newUser._doc,
        token: await getAccessToken({
          _id: newUser._id,
          email: newUser.email,
          rule: 1,
        }),
      },
    });
  } catch (error: any) {
    // Trả về mã lỗi 404 và phản hồi lỗi
    res.status(404).json({
			message: error.message,
		});
  }
};
const login = async (req: any, res: any) => {
  const body = req.body;
  const {  email, password } = body;

  try {
    const user: any = await UserModel.findOne({ email });
    if (!user) {
      throw new Error(`Email ${email} không tồn tại`);
    }
    const isMatchPassword = await bcrypt.compare(body.password, user.password);
    if (!isMatchPassword) {
      throw new Error(`Đăng Nhập Thất Bại!!! vui lòng kiểm tra lại email/password`);
    }
    delete user._doc.password;

    // Trả về phản hồi thành công với mã trạng thái 200
    res.status(200).json({
      message: "Đăng Nhập Thành Công !!!",
      data: {
        ...user._doc,
        token: await getAccessToken({
          _id: user._id,
          email: user.email,
          rule: user.rule ?? 1,
        }),
      },
    });
  } catch (error: any) {
    // Trả về mã lỗi 404 và phản hồi lỗi
    res.status(404).json({
			message: error.message,
		});
  }
};

export { register,login };
