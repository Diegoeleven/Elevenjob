import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://iykcmdxwrakkundxembn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a2NtZHh3cmFra3VuZHhlbWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTg3NDAsImV4cCI6MjA2MzA5NDc0MH0.0Xoj3JPDagwm6E934HTqSB3nmZL_WwrfZrlHCtyMqtc'
);