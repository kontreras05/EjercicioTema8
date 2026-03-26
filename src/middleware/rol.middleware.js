export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No se ha autenticado' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ error: 'No tienes los permisos necesarios' });
    }

    next();
  };
};
