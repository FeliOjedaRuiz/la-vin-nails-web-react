import Layout from "../components/layouts/Layout";
import UserDetail from "../components/users/user-detail/UserDetail";
import { useParams } from "react-router-dom";

function UserDetailPage() {
  const { id } = useParams();

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <UserDetail userId={id} />
      </div>
    </Layout>
  );
}

export default UserDetailPage;
