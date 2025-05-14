const getInitials = (name) => {
    if (!userInfo) return '';


    const firstInitial = name ? name.charAt(0) : '';
    const lastInitial = name ? name.split(' ')[1].charAt(0) : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };