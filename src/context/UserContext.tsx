import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  bairro: string;
  cidade: string;
}

interface Neighborhood {
  name: string;
}

interface UserContextProps {
  user: User | null;
  setUser: (user: User) => void;
  neighborhood: Neighborhood;
  setNeighborhood: (neighborhood: Neighborhood) => void;
  hasNewInformation: boolean;
  setHasNewInformation: (value: boolean) => void;
}

const defaultNeighborhood: Neighborhood = {
  name: 'Centro',
};

const UserContext = createContext<UserContextProps>({
  user: null,
  setUser: () => {},
  neighborhood: defaultNeighborhood,
  setNeighborhood: () => {},
  hasNewInformation: false,
  setHasNewInformation: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [neighborhood, setNeighborhood] = useState<Neighborhood>(defaultNeighborhood);
  const [hasNewInformation, setHasNewInformation] = useState<boolean>(false);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        neighborhood,
        setNeighborhood,
        hasNewInformation,
        setHasNewInformation,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);

export { UserContext };
