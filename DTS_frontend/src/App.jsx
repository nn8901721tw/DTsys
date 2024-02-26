import React from 'react';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom";
import { ProtectedLogin, ProtectedRoute } from "./utils/ProtectedRoute";
import { AuthProvider } from "./utils/AuthContext";

import HomePage from "./pages/home/HomePage";
import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import Kanban from "./pages/Kanban/Kanban";
import RootLayout from "./layouts/RootLayout";
import ProjectLayout from "./layouts/ProjectLayout";
import Bulletin from "./pages/bulletin/Bulletin";
import List from "./pages/list/List";
import SubmitTask from "./pages/submit/SubmitTask";
import ManagePhase from "./pages/managePhase/ManagePhase";
import Reflection from "./pages/reflection/Reflection";
import Protfolio from './pages/protfolio/Protfolio';
import ManageIdeaWall from "./pages/manageIdeaWall/ManageIdeaWall";
import IdeaWall from "./pages/ideaWall/IdeaWall";
import NotFound from "./pages/notFound/NotFound";


export default function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />} >
        <Route element={<ProtectedLogin />}>
          <Route index element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="homepage" element={<HomePage />} />
          <Route path="bulletin" element={<Bulletin />} />
          <Route path="List" element={<List />} />
          <Route path="project/:projectId" element={<ProjectLayout />}>
            <Route path="kanban" element={<Kanban />} />
            <Route path="submitTask" element={<SubmitTask />} />
            <Route path="managePhase" element={<ManagePhase />} />
            <Route path="reflection" element={<Reflection />} />
            <Route path="protfolio" element={<Protfolio />} />
            <Route path="manageIdeaWall" element={<ManageIdeaWall />} />
            <Route path="ideaWall" element={<IdeaWall />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />}></Route>
      </Route>  
    )
  )

  return ( 
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  )
}

