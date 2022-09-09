import * as React from "react";
import { render } from "@testing-library/react";
import Search from "../pages/index";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import { handlers } from "../mocks/handler";
import { setupServer } from "msw/node";
import {within} from '@testing-library/dom'
import userEvent from "@testing-library/user-event";

describe("Search", () => {
  const user = userEvent.setup();
  const server = setupServer(...handlers);

  beforeEach(() => {
    server.listen();
  });

  afterEach(() => {
    server.close();
  });

  it("renders a heading", async () => {
    const { getByRole } = render(<Search />);

    await act(async () => new Promise((r) => setTimeout(r, 500)));
    const heading = getByRole("heading", {
      name: /Article Search/i,
    });

    expect(heading).toBeInTheDocument();
  });

  it("Search Queryの変化に伴い結果件数が変化するかのテスト", async () => {
    const {
      baseElement,
      container,
      getByTestId,
      getAllByTestId,
      queryAllByTestId,
      getByTitle,
      getByPlaceholderText,
    } = render(<Search></Search>);
    const searchButton = getByTitle("Submit the search query.");

    expect(container).toMatchSnapshot();
    expect(searchButton).toBeVisible();
    const searchInput = getByPlaceholderText("Search");

    await user.click(searchButton);
    user.type(searchInput, "m");

    // 検索入力後すぐはリクエストが送信されないので結果が返ってきていない状態
    expect(queryAllByTestId("hit-card")).toHaveLength(0);

    // 1秒後にリクエスト、レンダリングされるので2秒まってレンダリングされたかの確認
    await act(async () => {
      await new Promise((r) => setTimeout(r, 1500));
    });
    expect(queryAllByTestId("hit-card")).toHaveLength(40);
    expect(document.querySelectorAll('div[data-testid="hatenablog"] div[data-testid="hit-card"]')).toHaveLength(20)
    expect(document.querySelectorAll('div[data-testid="til"] div[data-testid="hit-card"]')).toHaveLength(20)
    expect(container).toMatchSnapshot()

    // Query内容が変わったとき、すぐにはリクエストが送信されないため変更なし
    user.type(searchInput, "s");
    expect(queryAllByTestId("hit-card")).toHaveLength(40);

    // 入力が終わったと判断され、新たにリクエスト送信。検索結果にも反映されているかの確認
    await act(async () => {
      await new Promise((r) => setTimeout(r, 1500));
    });
    expect(queryAllByTestId("hit-card")).toHaveLength(15);
    expect(document.querySelectorAll('div[data-testid="hatenablog"] div[data-testid="hit-card"]')).toHaveLength(7)
    expect(document.querySelectorAll('div[data-testid="til"] div[data-testid="hit-card"]')).toHaveLength(8)
    expect(container).toMatchSnapshot()

    // Query内容が変わったとき、すぐにはリクエストが送信されないため変更なし
    user.type(searchInput, "w");
    expect(queryAllByTestId("hit-card")).toHaveLength(15);

    // 入力が終わったと判断され、新たにリクエスト送信。検索結果にも反映されているかの確認
    await act(async () => {
      await new Promise((r) => setTimeout(r, 1500));
    });
    expect(queryAllByTestId("hit-card")).toHaveLength(4);
    expect(document.querySelectorAll('div[data-testid="hatenablog"] div[data-testid="hit-card"]')).toHaveLength(1)
    expect(document.querySelectorAll('div[data-testid="til"] div[data-testid="hit-card"]')).toHaveLength(3)
    expect(container).toMatchSnapshot()
  });

  it("Search Show Moreのテスト", async () => {
    const {
      container,
      queryAllByTestId,
      findAllByTestId,
      getByTitle,
      getByPlaceholderText,
      getAllByText,
    } = render(<Search></Search>);
    const searchButton = getByTitle("Submit the search query.");

    expect(container).toMatchSnapshot();
    expect(searchButton).toBeVisible();
    const searchInput = getByPlaceholderText("Search");

    await user.click(searchButton);
    user.type(searchInput, "m");

    // 検索入力後すぐはリクエストが送信されないので結果が返ってきていない状態
    expect(queryAllByTestId("hit-card")).toHaveLength(0);

    // 1秒後にリクエスト、レンダリングされるので2秒まってレンダリングされたかの確認
    await act(async () => {
      await new Promise((r) => setTimeout(r, 1500));
    });
    expect(queryAllByTestId("hit-card")).toHaveLength(40);
    expect(document.querySelectorAll('div[data-testid="hatenablog"] div[data-testid="hit-card"]')).toHaveLength(20)
    expect(document.querySelectorAll('div[data-testid="til"] div[data-testid="hit-card"]')).toHaveLength(20)
    expect(container).toMatchSnapshot()

    const showMore = getAllByText('Show more results')
    user.click(showMore[0])

    await act(async () => {
      await new Promise((r) => setTimeout(r, 1500));
    });
    expect(queryAllByTestId("hit-card")).toHaveLength(60);
    expect(document.querySelectorAll('div[data-testid="hatenablog"] div[data-testid="hit-card"]')).toHaveLength(40)
    expect(document.querySelectorAll('div[data-testid="til"] div[data-testid="hit-card"]')).toHaveLength(20)
    expect(container).toMatchSnapshot()
  });
});
