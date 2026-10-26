
export const checkHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Context Firewall backend is healthy",
    timestamp: new Date().toISOString(),
  });
};
