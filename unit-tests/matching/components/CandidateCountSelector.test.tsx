import { fireEvent, render, screen } from "@testing-library/react";

import { CandidateCountSelector } from "@/features/matching/components/CandidateRerollRequest";

describe("CandidateCountSelector", () => {
  it("선택 가능한 최대 인원에 도달하면 추가 버튼을 비활성화한다", () => {
    const onChange = jest.fn();

    render(
      <CandidateCountSelector
        label="프론트엔드 개발"
        count={2}
        maximum={2}
        onChange={onChange}
      />,
    );

    const addButton = screen.getByRole("button", {
      name: "프론트엔드 개발 추천 인원 추가",
    });

    expect(addButton).toBeDisabled();
    fireEvent.click(addButton);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("최대 인원보다 적게 선택한 경우 추가할 수 있다", () => {
    const onChange = jest.fn();

    render(
      <CandidateCountSelector
        label="프론트엔드 개발"
        count={1}
        maximum={2}
        onChange={onChange}
      />,
    );

    const addButton = screen.getByRole("button", {
      name: "프론트엔드 개발 추천 인원 추가",
    });

    expect(addButton).toBeEnabled();
    fireEvent.click(addButton);
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
