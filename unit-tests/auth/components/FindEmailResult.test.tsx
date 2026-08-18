import { render, screen } from "@testing-library/react";

import { FindEmailResult } from "@/features/auth/components/FindEmailResult";

it("역할별 라벨과 마스킹된 이메일을 함께 보여준다", () => {
  render(
    <FindEmailResult
      accounts={[
        { role: "CLIENT", maskedEmail: "cl***@pairing.com" },
        { role: "FREELANCER", maskedEmail: "fr***@pairing.com" },
      ]}
    />,
  );

  expect(screen.getByText("클라이언트 계정")).toBeInTheDocument();
  expect(screen.getByText("cl***@pairing.com")).toBeInTheDocument();
  expect(screen.getByText("프리랜서 계정")).toBeInTheDocument();
  expect(screen.getByText("fr***@pairing.com")).toBeInTheDocument();
});

it("계정이 하나면 하나의 결과만 보여준다", () => {
  render(<FindEmailResult accounts={[{ role: "CLIENT", maskedEmail: "cl***@pairing.com" }]} />);

  expect(screen.getAllByText(/계정$/)).toHaveLength(1);
});
