import { CollectForm } from "./form";

export default function CollectPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">수집 실행</h1>
      <p className="text-sm text-muted">키워드(제품명·원료명)를 줄바꿈으로 구분해 입력하세요. 한 번에 최대 20개. 식약처 API는 키워드당 최대 2페이지(200건), 네이버는 가중치 설정의 페이지 수만큼 호출합니다.</p>
      <CollectForm />
    </div>
  );
}
