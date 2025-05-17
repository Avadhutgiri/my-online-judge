import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import Layout from './Layout/Layout.jsx';
import LoginPage from '../src/Pages/LoginPage.jsx';
import InstructionPage from '../src/Pages/InstructionPage.jsx';
import QuestionHub from '../src/Pages/QuestionHub.jsx';
import CodingPage from '../src/Pages/CodingPage/CodingPage.jsx';
import Leaderboards from '../src/Pages/Leaderboards.jsx';
import ResultPage from './Pages/ResultPage.jsx';
import RegisterPage from './Pages/RegisterPage.jsx';
import RegisterTeam from './Pages/RegisterTeam.jsx';


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<LoginPage/>} />
      <Route path='/register' element={<RegisterPage/>}/>
      <Route path='/registerTeam' element={<RegisterTeam/>}/>
      <Route path='/instructions' element={<InstructionPage/>} />
      <Route path='/questionhub' element={<QuestionHub/>} />
      <Route path='/coding/problem/:id' element={<CodingPage/>} />
      <Route path='/leaderboard' element={<Leaderboards/>} />
      <Route path='/result' element={<ResultPage/>} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
    
)
