import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  SignupPasswordFields,
  isSignupPasswordValid,
} from "@/features/auth/components/SignupPasswordFields";

function Wrapper() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <SignupPasswordFields
      password={password}
      confirmPassword={confirmPassword}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
    />
  );
}

it("모든 규칙 라벨을 보여준다", () => {
  render(<Wrapper />);

  expect(screen.getByText("8자 이상 20자 이하")).toBeInTheDocument();
  expect(screen.getByText("영문 대문자 포함")).toBeInTheDocument();
  expect(screen.getByText("영문 소문자 포함")).toBeInTheDocument();
  expect(screen.getByText("숫자 포함")).toBeInTheDocument();
  expect(screen.getByText("특수문자 포함")).toBeInTheDocument();
});

it("비밀번호를 입력하지 않으면 비밀번호 확인 안내가 보이지 않는다", () => {
  render(<Wrapper />);

  expect(screen.queryByText("비밀번호가 일치합니다.")).not.toBeInTheDocument();
  expect(screen.queryByText("비밀번호가 일치하지 않습니다.")).not.toBeInTheDocument();
});

it("비밀번호와 확인이 다르면 불일치 메시지를 보여준다", async () => {
  const user = userEvent.setup();
  render(<Wrapper />);

  await user.type(screen.getByLabelText("비밀번호 *"), "Abcdefg1!");
  await user.type(screen.getByLabelText("비밀번호 확인 *"), "Abcdefg2!");

  expect(screen.getByText("비밀번호가 일치하지 않습니다.")).toBeInTheDocument();
});

it("비밀번호와 확인이 같으면 일치 메시지를 보여준다", async () => {
  const user = userEvent.setup();
  render(<Wrapper />);

  await user.type(screen.getByLabelText("비밀번호 *"), "Abcdefg1!");
  await user.type(screen.getByLabelText("비밀번호 확인 *"), "Abcdefg1!");

  expect(screen.getByText("비밀번호가 일치합니다.")).toBeInTheDocument();
});

it("보기 버튼을 누르면 비밀번호 입력 타입이 text로 바뀐다", async () => {
  const user = userEvent.setup();
  render(<Wrapper />);

  const passwordInput = screen.getByLabelText("비밀번호 *");
  expect(passwordInput).toHaveAttribute("type", "password");

  await user.click(screen.getAllByRole("button", { name: "보기" })[0]);

  expect(passwordInput).toHaveAttribute("type", "text");
});

describe("isSignupPasswordValid", () => {
  it("모든 규칙을 만족하고 두 값이 같아야 true", () => {
    expect(isSignupPasswordValid("Abcdefg1!", "Abcdefg1!")).toBe(true);
  });

  it("규칙을 만족하지 못하면 false", () => {
    expect(isSignupPasswordValid("abcdefg1", "abcdefg1")).toBe(false);
  });

  it("값이 다르면 false", () => {
    expect(isSignupPasswordValid("Abcdefg1!", "Abcdefg2!")).toBe(false);
  });
});
