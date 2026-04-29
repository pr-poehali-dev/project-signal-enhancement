CREATE TABLE t_p40935833_project_signal_enhan.reviews (
  id SERIAL PRIMARY KEY,
  author VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);