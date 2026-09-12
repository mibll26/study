import { getCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/db";
import { saveCredentials, loadSampleData, clearSampleData } from "@/lib/actions/settings";
import { CredentialsForm } from "./form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [cred, sampleCount] = await Promise.all([
    getCredentials(),
    prisma.product.count({ where: { OR: [{ keyword: { startsWith: "[샘플]" } }, { keyword: { startsWith: "[테스트]" } }] } }),
  ]);
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">API 키 설정</h1>
      <p className="text-sm text-muted">키를 붙여넣고 저장하면 바로 수집에 사용됩니다. 서버 재시작 불필요. 키는 이 PC의 로컬 DB(prisma/dev.db)에만 저장됩니다.</p>

      <CredentialsForm initial={cred} save={saveCredentials} />

      <section className="card space-y-3">
        <h2 className="font-semibold">샘플 데이터</h2>
        <p className="text-sm text-muted">API 키가 없어도 화면과 점수 계산을 확인할 수 있도록 가상의 제품 10건을 넣습니다. 키워드가 <code>[샘플]</code>로 시작하며, 실제 수집 전에 아래 버튼으로 지우세요. 현재 {sampleCount}건.</p>
        <div className="flex gap-2">
          <form action={loadSampleData}><button className="btn" type="submit">샘플 데이터 넣기</button></form>
          <form action={clearSampleData}><button className="btn" type="submit" disabled={sampleCount === 0}>샘플·테스트 데이터 삭제</button></form>
        </div>
      </section>
    </div>
  );
}
