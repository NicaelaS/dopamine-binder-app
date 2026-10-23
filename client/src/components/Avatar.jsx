import { useEffect, useState } from 'react';
import styles from './Avatar.module.css';
import { fetchProfile } from '../services/api';

let cachedUser = null;
let pendingUserRequest = null;

const getCurrentUser = async () => {
  if (cachedUser) {
    return cachedUser;
  }

  if (!pendingUserRequest) {
    pendingUserRequest = fetchProfile()
      .then((data) => {
        cachedUser = data?.user ?? null;
        return cachedUser;
      })
      .catch((error) => {
        console.error('Failed to load current user for avatar:', error);
        cachedUser = null;
        return null;
      })
      .finally(() => {
        pendingUserRequest = null;
      });
  }

  return pendingUserRequest;
};

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (!parts.length) {
    return '';
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

function Avatar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();

        if (isMounted) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load current user for avatar:', error);

        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className={styles.avatar} aria-label="Loading profile" />;
  }

  const photoUrl = user?.photoUrl || user?.avatar || '';
  const initials = getInitials(user?.name || '');

  if (photoUrl && !imageFailed) {
    return (
      <div className={styles.avatar}>
        <img
          src={photoUrl}
          alt="Your profile photo"
          referrerPolicy="no-referrer"
          className={styles.image}
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={styles.avatar} aria-label={user?.name || 'Profile'}>
      <span className={styles.initials}>{initials}</span>
    </div>
  );
}

export default Avatar;
