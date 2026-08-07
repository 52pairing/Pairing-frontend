import { PaymentComplete } from "@/features/payment/components/PaymentComplete";

export default function PaymentCompletePage() {
  return (
    <PaymentComplete
      title="결제가 완료되었습니다"
      status="프로젝트 상태: 모집 중"
      description={
        <>
          프로젝트 상태가 모집 중으로 변경되었습니다.
          <br />
          이제 프로젝트에 적합한 프리랜서를 찾아보세요.
        </>
      }
      homeHref="/client"
      detailHref="/client/projects"
      detailLabel="내 프로젝트 보기"
    />
  );
}
