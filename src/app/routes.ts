import { createBrowserRouter } from "react-router";
import { UserHome } from "./pages/user/UserHome";
import { UserTimeLandscape } from "./pages/user/UserTimeLandscape";
import { UserMessages } from "./pages/user/UserMessages";
import { UserMessageThread } from "./pages/user/UserMessageThread";
import { UserNoveltyIdeas } from "./pages/user/UserNoveltyIdeas";
import { FamilyHome } from "./pages/family/FamilyHome";
import { FamilyStats } from "./pages/family/FamilyStats";
import { FamilyTimeLandscape } from "./pages/family/FamilyTimeLandscape";
import { FamilyMessages } from "./pages/family/FamilyMessages";
import { FamilyMessageThread } from "./pages/family/FamilyMessageThread";
import { AppSelector } from "./pages/AppSelector";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppSelector,
  },
  {
    path: "/user",
    children: [
      { index: true, Component: UserHome },
      { path: "time-landscape", Component: UserTimeLandscape },
      { path: "messages", Component: UserMessages },
      { path: "messages/:contactId", Component: UserMessageThread },
      { path: "novelty-ideas", Component: UserNoveltyIdeas },
    ],
  },
  {
    path: "/family",
    children: [
      { index: true, Component: FamilyHome },
      { path: "stats", Component: FamilyStats },
      { path: "time-landscape-family", Component: FamilyTimeLandscape },
      { path: "messages", Component: FamilyMessages },
      { path: "messages/:contactId", Component: FamilyMessageThread },
    ],
  },
]);