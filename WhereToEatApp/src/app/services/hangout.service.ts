import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Hangout } from '../models/hangout.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HangoutService {

  constructor(private firestore: AngularFirestore,) { }

  // Create a new hangout
  public async createHangout(hangout: Hangout) {

    try {
      await this.firestore.collection('hangouts').add(hangout);
    } catch (error) {
      console.error('Error creating hangout:', error);
    }
  }

  // Generate a unique join ID for hangout
  generateJoinId() {
    // This is a simplistic implementation; consider a more robust solution
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  // Add a restaurant to a hangout
  async addRestaurant(hangoutId: string, restaurantId: string) {
    const hangoutRef = this.firestore.collection('hangouts').doc(hangoutId);

    try {
      await hangoutRef.update({
        // restaurants: this.firestore.firestore.FieldValue.arrayUnion(restaurantId)
      });
    } catch (error) {
      console.error('Error adding restaurant:', error);
    }
  }

  // Join a hangout
  async joinHangout(joinId: string, userId: string) {
    const hangoutRef = this.firestore.collection('hangouts').doc(joinId);

    try {
      await hangoutRef.update({
        // participants: this.firestore.firestore.FieldValue.arrayUnion(userId)
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
}
