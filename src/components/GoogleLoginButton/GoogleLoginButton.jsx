import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../contexts/AuthContext";

// Dùng component GoogleLogin có sẵn của @react-oauth/google (render đúng nút chuẩn của
// Google, tự xử lý popup chọn tài khoản) — không tự vẽ nút giả để tránh vi phạm brand
// guideline của Google và đảm bảo hành vi bảo mật chuẩn (nonce, popup an toàn...).
const GoogleLoginButton = ({ onSuccess, onError }) => {
  const { loginWithGoogle } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    try {
      // credentialResponse.credential CHÍNH LÀ ID Token (JWT) do Google cấp — gửi thẳng
      // lên Backend để verify, Client không tự giải mã hay tin bất kỳ thông tin nào bên
      // trong token này.
      await loginWithGoogle(credentialResponse.credential);
      onSuccess?.();
    } catch (err) {
      onError?.(err.response?.data?.message || "Đăng nhập Google thất bại, vui lòng thử lại.");
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => onError?.("Đăng nhập Google thất bại, vui lòng thử lại.")}
      theme="outline"
      size="large"
      
      text="continue_with"
      locale="vi"
    />
  );
};

export default GoogleLoginButton;