import React, { useEffect, useState } from 'react';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/v1/notices?slug=comunicado'); // Cambia la URL por la de tu servidor
        if (!response.ok) {
          throw new Error('Error fetching the notices');
        }
        const data = await response.json();
        setNotices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <ul>
        {notices.map((notice, index) => (
          <li key={index}>
            <h2>{notice.title} </h2>
            <p>{notice.subtitle}</p>
            <p>{notice.description}</p>
            
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notices;
