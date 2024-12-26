import Layout from "../components/layouts/Layout";
import NailPhotoGalery from "../components/nails-photos/nail-photo-galery/NailPhotoGalery";
import PhotoUpload from "../components/nails-photos/photo-upload/PhotoUpload";
import UserDetail from "../components/users/user-detail/UserDetail";
import { useParams } from "react-router-dom";

function UserDetailPage() {
  const { id } = useParams();

  return (
    <Layout>
      <div className="flex flex-col items-center p-4">
        <PhotoUpload userId={id} />
        <NailPhotoGalery userId={id} />
        <UserDetail userId={id} />
      </div>
    </Layout>
  );
}

export default UserDetailPage;
