import { PaymentComplete } from "@/features/payment/components/PaymentComplete";

export default function FreelancerUpfrontPaymentCompletePage() {
  return (
    <PaymentComplete
      title="착수금 수수료 결제가 완료되었습니다"
      status="프로젝트 상태: 진행 중"
      description={
        <>
          착수금 수수료 결제가 정상적으로 처리되었습니다.
          <br />
          이제 계약된 프로젝트를 시작할 수 있습니다.
        </>
      }
      homeHref="/freelancer"
      detailHref="/freelancer/contracts"
      detailLabel="진행 중인 계약 보기"
    />
  );
}
