import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Hangout } from '../models/hangout.model';
import { Observable, combineLatest, map, switchMap } from 'rxjs';
import { Restaurant } from '../models/restaurant.model';
import { updateDoc, arrayUnion, doc } from '@firebase/firestore';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class HangoutService {

  constructor(private firestore: AngularFirestore,) { }

  // Create a new hangout
  public async createHangout(hangout: Hangout): Promise<boolean> {
    try {
      // Step 1: Create the document and get the doc ID
      const docRef = await this.firestore.collection('hangouts').add(hangout);

      // Step 2: Update the newly created document with its ID
      await this.firestore.doc(`hangouts/${docRef.id}`).update({
        id: docRef.id
      });
      return true;
    } catch (error) {
      return false;
    }
  }


  // Generate a unique join ID for hangout
  generateJoinId() {
    // This is a simplistic implementation; consider a more robust solution
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  async addRestaurant(hangoutId: string, restaurant: Restaurant) {
    const hangoutRef = doc(this.firestore.firestore, 'hangouts', hangoutId);

    try {
      await updateDoc(hangoutRef, {
        restaurants: arrayUnion(restaurant)
      });
    } catch (error) {
      console.error('Error adding restaurant:', error);
    }
  }

  // Join a hangout
  async joinHangout(joinId: string, userId: string) {
    const hangoutRef = doc(this.firestore.firestore, 'hangouts', joinId);

    try {
      await updateDoc(hangoutRef, {
        participants: arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error joining hangout:', error);
    }
  }

  // Cast or update a vote
  async castVote(userId: string, hangoutId: string, restaurantId: string) {
    const voteRef = this.firestore.collection('votes').doc(`${userId}_${hangoutId}`);

    try {
      const voteSnapshot = await voteRef.get().toPromise();

      if (voteSnapshot?.exists) {
        // Update existing vote
        await voteRef.update({ restaurantId });
      } else {
        // Cast new vote
        const voteData = { userId, hangoutId, restaurantId };
        await voteRef.set(voteData);
      }
    } catch (error) {
      console.error('Error casting vote:', error);
    }
  }

  getActiveHangoutsForUser(userId: string | undefined): Observable<Hangout[]> {
    return this.firestore.collection<Hangout>('hangouts', ref =>
      ref.where('active', '==', true).where('participants', 'array-contains', userId)
    ).valueChanges();
  }

  getPastHangoutsForUser(userId: string | undefined): Observable<Hangout[]> {
    return this.firestore.collection<Hangout>('hangouts', ref =>
      ref.where('active', '==', false).where('participants', 'array-contains', userId)
    ).valueChanges();
  }

  getHangout(hangoutId: string): Observable<any> {
    return this.firestore.doc<Hangout>(`hangouts/${hangoutId}`).valueChanges().pipe(
      switchMap(hangout => {
        if (hangout) {
          const createdBy$ = this.getUserById(hangout.createdBy);
          const participants$ = combineLatest(hangout.participants.map(id => this.getUserById(id)));

          return combineLatest([createdBy$, participants$]).pipe(
            map(([createdBy, participants]) => {
              return {
                ...hangout,
                createdBy,
                participants
              };
            })
          );
        }
        return [];
      })
    );
  }

  // Assuming you have a function to get user by ID.
  getUserById(id: string): Observable<any> {
    return this.firestore.doc<User>(`users/${id}`).valueChanges();
  }
}
