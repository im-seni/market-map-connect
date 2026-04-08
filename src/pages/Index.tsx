import { Navigate } from "react-router-dom";

/** Legacy path: old single-page app lived at `/`. Main prototype uses `/` splash; map home to `/home`. */
export default function Index() {
  return <Navigate to="/home" replace />;
}
