/**
 * Lấy API URL theo thứ tự ưu tiên:
 * 1. localStorage "API_URL" (runtime override - tiện cho demo, đổi tunnel URL không cần redeploy)
 * 2. VUE_APP_API_URL (build-time env, set trên Vercel)
 * 3. Fallback localhost:5000
 *
 * Để đổi API URL tại runtime, mở Console trình duyệt gõ:
 *   localStorage.setItem("API_URL", "https://xxx.trycloudflare.com")
 * rồi refresh trang.
 *
 * Để reset về mặc định:
 *   localStorage.removeItem("API_URL")
 */
export function getApiUrl() {
  if (typeof window !== "undefined") {
    const override = localStorage.getItem("API_URL");
    if (override) return override;
  }
  return process.env.VUE_APP_API_URL || "http://localhost:5000";
}
