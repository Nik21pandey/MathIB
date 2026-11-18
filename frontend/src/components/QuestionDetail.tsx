import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

/** Legacy route wrapper: redirects /questions/:id to the new QuestionPage (/question/:slug) or /contents. */
const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  if (id) {
    return <Navigate to={`/question/${id}`} replace />;
  }
  return <Navigate to="/contents" replace />;
};

export default QuestionDetail;
