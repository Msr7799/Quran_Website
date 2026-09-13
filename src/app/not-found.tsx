import Link from "next/link";
import { LottiePlayer } from "@/components/LottiePlayer";
export default function NotFound() {
  return (
    <div className="not-found">
      <LottiePlayer
        className="not-found-animation"
        src="/lottie/notFound.json"
        label="الصفحة غير موجودة"
      />
      <h1>الصفحة غير موجودة</h1>
      <p>يبدو أن الرابط غير صحيح أو أن الصفحة نُقلت.</p>
      <Link className="button primary" href="/">
        العودة للرئيسية
      </Link>
    </div>
  );
}
